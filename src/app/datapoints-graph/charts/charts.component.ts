import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import type { ECharts, EChartsOption, SeriesOption } from 'echarts';
import {
  AlarmDetailsExtended,
  AlarmOrEventExtended,
  DatapointsGraphKPIDetails,
  DatapointsGraphWidgetConfig,
  DatapointsGraphWidgetTimeProps,
  DatapointWithValues,
  EventDetailsExtended,
  INTERVALS,
  MarkLineData,
} from '../model';
import { BehaviorSubject, forkJoin, lastValueFrom, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CustomMeasurementService } from './custom-measurements.service';
import {
  AlarmRealtimeService,
  CoreModule,
  DismissAlertStrategy,
  DynamicComponentAlert,
  DynamicComponentAlertAggregator,
  EventRealtimeService,
  gettext,
  MeasurementRealtimeService,
} from '@c8y/ngx-components';
import { TranslateService } from '@ngx-translate/core';
import { EchartsOptionsService } from './echarts-options.service';
import { ChartRealtimeService } from './chart-realtime.service';
import type { DataZoomOption } from 'echarts/types/src/component/dataZoom/DataZoomModel';
import type {
  CallbackDataParams,
  ECActionEvent,
  TooltipFormatterCallback,
} from 'echarts/types/src/util/types';
import { ChartTypesService } from './chart-types.service';
import { CommonModule } from '@angular/common';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { YAxisService } from './y-axis.service';
import { ChartAlertsComponent } from './chart-alerts/chart-alerts.component';
import { aggregationType, AlarmStatus, IAlarm, IEvent } from '@c8y/client';
import { ChartEventsService } from '../datapoints-graph-view/chart-events.service';
import { ChartAlarmsService } from '../datapoints-graph-view/chart-alarms.service';
import { EchartsCustomOptions } from './chart.model';
import { TopLevelFormatterParams } from 'echarts/types/src/component/tooltip/TooltipModel';
import {
  AlarmSeverityToIconPipe,
  AlarmSeverityToLabelPipe,
  AlarmsModule,
} from '@c8y/ngx-components/alarms';

type ZoomState = Record<'startValue' | 'endValue', number | string | Date>;

@Component({
  selector: 'c8y-charts',
  templateUrl: './charts.component.html',
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts: () => import('echarts') }),
    },
    ChartRealtimeService,
    MeasurementRealtimeService,
    AlarmRealtimeService,
    EventRealtimeService,
    ChartTypesService,
    EchartsOptionsService,
    CustomMeasurementService,
    YAxisService,
    AlarmSeverityToIconPipe,
    AlarmSeverityToLabelPipe,
  ],
  standalone: true,
  imports: [
    CommonModule,
    CoreModule,
    NgxEchartsModule,
    TooltipModule,
    PopoverModule,
    ChartAlertsComponent,
    AlarmsModule,
  ],
})
export class ChartsComponent implements OnChanges, OnInit, OnDestroy {
  chartOption$: Observable<EChartsOption>;
  echartsInstance!: ECharts;
  sliderEchartsInstance!: ECharts;
  initialTimeRange!: { dateFrom: string; dateTo: string };
  firstLoad?: boolean = true;
  sliderChartOptions: any = {};
  showLoadMore = false;
  zoomHistory: ZoomState[] = [];
  zoomInActive = false;
  alarms: IAlarm[] = [];
  events: IEvent[] = [];
  @Input() config!: DatapointsGraphWidgetConfig;
  @Input() alerts!: DynamicComponentAlertAggregator;
  @Output() configChangeOnZoomOut =
    new EventEmitter<DatapointsGraphWidgetTimeProps>();
  @Output() timeRangeChangeOnRealtime = new EventEmitter<
    Pick<DatapointsGraphWidgetConfig, 'dateFrom' | 'dateTo'>
  >();
  @Output() datapointOutOfSync = new EventEmitter<DatapointsGraphKPIDetails>();
  @Output() updateAlarmsAndEvents = new EventEmitter<AlarmOrEventExtended[]>();
  @Output() isMarkedAreaEnabled = new EventEmitter<boolean>();
  private configChangedSubject = new BehaviorSubject<void | null>(null);

  @HostListener('keydown.escape') onEscapeKeyDown() {
    if (this.zoomInActive) {
      this.toggleZoomIn();
    }
  }

  constructor(
    private measurementService: CustomMeasurementService,
    private translateService: TranslateService,
    private echartsOptionsService: EchartsOptionsService,
    private chartRealtimeService: ChartRealtimeService,
    private chartEventsService: ChartEventsService,
    private chartAlarmsService: ChartAlarmsService
  ) {
    this.chartOption$ = this.configChangedSubject.pipe(
      switchMap(() => this.loadAlarmsAndEvents()),
      switchMap(() => this.fetchSeriesForDatapoints$()),
      switchMap((datapointsWithValues: DatapointWithValues[]) => {
        if (datapointsWithValues.length === 0) {
          this.echartsInstance?.clear();
          return of(this.getDefaultChartOptions());
        }
        return this.getChartOptions(datapointsWithValues);
      }),
      tap((v) => {
        if (this.zoomInActive) {
          this.toggleZoomIn();
        }
        this.chartRealtimeService.stopRealtime();
        this.startRealtimeIfPossible();
        if (this.echartsInstance) {
          this.echartsInstance.setOption(v, true);
        }
      })
    );
  }

  ngOnChanges() {
    this.configChangedSubject.next();
  }

  ngOnInit() {
    this.alerts.setAlertGroupDismissStrategy(
      'warning',
      DismissAlertStrategy.TEMPORARY_OR_PERMANENT
    );
  }

  ngOnDestroy() {
    this.chartRealtimeService.stopRealtime();
  }

  onChartInit(ec: ECharts) {
    this.echartsInstance = ec;
    this.echartsOptionsService.echartsInstance = this.echartsInstance;
    this.startRealtimeIfPossible();

    queueMicrotask(() => {
      this.updateZoomState();
    });
    const debouncedDataZoomHandler = this.debounce((event: any) => {
      const evt = event as ECActionEvent;
      const isZoomInActionFromHiddenToolbox = evt.batch?.[0]?.from != null;
      if (isZoomInActionFromHiddenToolbox) {
        this.updateZoomState();
        this.chartRealtimeService.stopRealtime();
      }

      if (evt.batch?.[0]?.start === 0 || evt['start'] === 0) {
        this.showLoadMore = true;
      }

      const options = this.echartsInstance.getOption();
      const dataZoom = options['dataZoom'][0];
      this.configChangeOnZoomOut.emit({
        dateFrom: new Date(dataZoom['startValue']),
        dateTo: new Date(dataZoom['endValue']),
        interval: 'custom',
      });
      this.echartsInstance.setOption(options);
    }, 50); // debounce

    this.echartsInstance.on('dataZoom', debouncedDataZoomHandler);
    this.echartsInstance.on('click', this.onChartClick.bind(this));

    let originalFormatter:
      | TooltipFormatterCallback<TopLevelFormatterParams>
      | string
      | null
      | undefined = null;

    this.echartsInstance.on('mouseover', (params: any) => {
      if (
        params?.componentType !== 'markLine' &&
        params?.componentType !== 'markPoint'
      ) {
        return;
      }

      const options = this.echartsInstance.getOption() as EChartsOption;
      if (
        !options.tooltip ||
        !Array.isArray(options.tooltip) ||
        !options.tooltip[0]
      ) {
        return;
      }
      originalFormatter = originalFormatter ?? options['tooltip'][0].formatter;

      const updatedOptions: Partial<SeriesOption> = {
        tooltip: options['tooltip'][0],
      };

      if (!updatedOptions.tooltip) {
        return;
      }
      updatedOptions.tooltip.formatter = (
        tooltipParams: CallbackDataParams
      ) => {
        return this.echartsOptionsService.getTooltipFormatterForAlarmAndEvents(
          tooltipParams,
          params,
          this.events,
          this.alarms
        );
      };

      this.echartsInstance.setOption(updatedOptions);
    });

    this.echartsInstance.on('mouseout', () => {
      const options = this.echartsInstance.getOption() as EchartsCustomOptions;
      if (originalFormatter) {
        options['tooltip'][0].formatter = originalFormatter;
        this.echartsInstance.setOption(options);
      }
    });
  }

  loadMoreData() {
    this.config.interval = 'custom';
    this.initialTimeRange.dateFrom = new Date(
      new Date(this.initialTimeRange.dateFrom).valueOf() - 5 * 60 * 60 * 1000
    ).toISOString();
    const options = this.echartsInstance.getOption();
    const dataZoom = options['dataZoom'][0];
    this.configChangeOnZoomOut.emit({
      dateFrom: new Date(dataZoom['startValue']),
      dateTo: new Date(dataZoom['endValue']),
      interval: 'custom',
    });
    this.showLoadMore = false;
  }

  debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // async onlySliderChartInit(ec: ECharts) {
  //   this.sliderEchartsInstance = ec;
  //   const timeRange = this.getTimeRange(60_000);

  //   const currentTimeRange = this.getTimeRange();

  //   const onlySliderTimeRange = {
  //     dateFrom: new Date(
  //       new Date(timeRange.dateFrom).valueOf() - 30 * 24 * 60 * 60 * 1000
  //     ).toISOString(),
  //     dateTo: timeRange.dateTo,
  //   };

  //   const alarms = await this.loadAlarms(onlySliderTimeRange);
  //   const markLines = alarms.map((alarm) => ({
  //     name: 'Alarm',
  //     xAxis: alarm['lastUpdated'],
  //     lineStyle: {
  //       color: 'red',
  //       type: 'dashed',
  //     },
  //     label: {
  //       formatter: `Alarm at ${new Date(alarm['lastUpdated']).toLocaleString()}`,
  //     },
  //   }));
  //   this.sliderChartOptions = {
  //     grid: {
  //       containLabel: false,
  //       top: 32,
  //       bottom: 24,
  //     },
  //     dataZoom: [
  //       {
  //         type: 'slider',
  //         show: true,
  //         xAxisIndex: 0,
  //         // startValue: currentTimeRange.dateFrom.valueOf(),
  //         // endValue: currentTimeRange.dateTo.valueOf(),
  //         start: 0,
  //         end: 100,
  //         realtime: false,
  //         filterMode: 'filter',
  //       },
  //     ],
  //     xAxis: {
  //       axisLine: { show: false },
  //       axisLabels: { show: false },
  //       axisTick: { show: false },
  //       type: 'time',
  //       min: onlySliderTimeRange.dateFrom,
  //       max: onlySliderTimeRange.dateTo,
  //     },
  //     yAxis: {
  //       type: 'value',
  //     },
  //     series: [
  //       { type: 'line', markLine: { data: [] } as any },
  //       {
  //         type: 'line', // Ensure the series type is specified
  //         markLine: {
  //           data: markLines,
  //         },
  //       },
  //     ],
  //   };

  //   this.sliderEchartsInstance.on('dataZoom', (event: any) => {
  //     console.log('dataZoom', event);
  //     console.log(this.getTimeRange());
  //     const startValue = this.calculateStartValueInMilliseconds(
  //       event['start'],
  //       new Date(timeRange.dateFrom).valueOf() - 30 * 24 * 60 * 60 * 1000,
  //       new Date(timeRange.dateTo).valueOf()
  //     );
  //     const endValue = this.calculateStartValueInMilliseconds(
  //       event['end'],
  //       new Date(timeRange.dateFrom).valueOf() - 30 * 24 * 60 * 60 * 1000,
  //       new Date(timeRange.dateTo).valueOf()
  //     );
  //     this.configChangeOnZoomOut.emit({
  //       dateFrom: new Date(startValue),
  //       dateTo: new Date(endValue),
  //       interval: 'custom',
  //     });
  //   });
  // }

  calculateStartValueInMilliseconds(
    startPercentage: number,
    earliestTimestamp: number,
    latestTimestamp: number
  ) {
    const totalTimeRange = latestTimestamp - earliestTimestamp;
    const startValueInMilliseconds =
      earliestTimestamp + (totalTimeRange * startPercentage) / 100;
    return startValueInMilliseconds;
  }

  onChartClick(params: any) {
    const options = this.echartsInstance.getOption();
    if (!this.isAlarmClick(params)) {
      this.echartsInstance.setOption({
        tooltip: { triggerOn: 'mousemove' },
        series: [
          {
            markArea: {
              data: [],
            },
            markLine: {
              data: [],
            },
          },
        ],
      });
      return;
    }

    const clickedAlarms = this.alarms.filter(
      (alarm) => alarm.type === params.data.itemType
    );

    this.isMarkedAreaEnabled.emit(this.hasMarkArea(options));
    const updatedOptions = !this.hasMarkArea(options)
      ? {
          tooltip: {
            enterable: true,
            triggerOn: 'click',
          },
          series: [
            {
              markArea: {
                label: {
                  show: false,
                },
                data: this.getMarkedAreaData(clickedAlarms),
              },
              markLine: {
                showSymbol: true,
                symbol: ['none', 'none'],
                data: this.getMarkedLineData(clickedAlarms),
              },
            },
          ],
        }
      : // if markArea already exists, remove it and remove lastUpdated from markLine
        {
          tooltip: { triggerOn: 'mousemove' },
          series: [
            {
              markArea: {
                data: [],
              },
              markLine: {
                data: [],
              },
            },
          ],
        };

    this.echartsInstance.setOption(updatedOptions);
  }

  isAlarmClick(params: any): boolean {
    return this.alarms.some((alarm) => alarm.type === params.data.itemType);
  }

  hasMarkArea(options: any): boolean {
    return options?.series?.[0]?.markArea?.data?.length > 0;
  }

  toggleZoomIn(): void {
    this.zoomInActive = !this.zoomInActive;
    this.echartsInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: this.zoomInActive,
    });
  }

  zoomOut(): void {
    if (this.zoomInActive) {
      this.toggleZoomIn();
    }
    this.zoomHistory.pop();
    if (this.zoomHistory.length) {
      this.echartsInstance.dispatchAction({
        type: 'dataZoom',
        startValue: this.zoomHistory[this.zoomHistory.length - 1].startValue,
        endValue: this.zoomHistory[this.zoomHistory.length - 1].endValue,
      });
      if (this.zoomHistory.length === 1) {
        // realtime should be only started when graph is not zoomed in and have only initial zoom state in its history
        this.startRealtimeIfPossible();
      }
    } else {
      const dataZoom: any = this.echartsInstance.getOption()['dataZoom'];
      const currentStartValue = dataZoom[0].startValue;
      const currentEndValue = dataZoom[0].endValue;
      const currentTimeRangeInMs = currentEndValue - currentStartValue;

      // new dateTo should not exceed today date
      const newDateTo = new Date(
        Math.min(
          currentEndValue + currentTimeRangeInMs / 2,
          new Date().valueOf()
        )
      );
      // every zoom out expands current time range times 2
      const newDateFrom = new Date(
        newDateTo.valueOf() - currentTimeRangeInMs * 2
      );

      this.configChangeOnZoomOut.emit({
        dateFrom: newDateFrom,
        dateTo: newDateTo,
        interval: 'custom',
      });
      this.zoomHistory.push({
        startValue: newDateFrom.valueOf(),
        endValue: newDateTo.valueOf(),
      });
    }
  }

  saveAsImage() {
    this.echartsInstance.setOption({
      legend: {
        show: true,
      },
    });
    const url = this.echartsInstance.getDataURL({
      pixelRatio: 2,
      backgroundColor: '#fff',
      type: 'png',
    });
    const link = document.createElement('a');
    link.href = url;
    link.download = 'datapoints-graph-screenshot';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.echartsInstance.setOption({
      legend: {
        show: false,
      },
    });
  }

  private getDefaultChartOptions(): EChartsOption {
    return {
      title: {
        text: 'No Data Available',
      },
      xAxis: {
        type: 'category',
        data: [],
      },
      yAxis: {
        type: 'value',
      },
      series: [],
    };
  }

  private getMarkedAreaData(clickedAlarms: IAlarm[]) {
    const timeRange = this.getTimeRange();
    const clearedAlarmColor = 'rgba(221,255,221,1.00)';
    const activeAlarmColor = 'rgba(255, 173, 177, 0.4)';

    return clickedAlarms.map((clickedAlarm) => {
      return [
        {
          name: clickedAlarm.type,
          xAxis: clickedAlarm.creationTime,
          itemStyle: {
            color:
              clickedAlarm.status === AlarmStatus.CLEARED
                ? clearedAlarmColor
                : activeAlarmColor,
          },
        },
        {
          xAxis:
            clickedAlarm['lastUpdated'] === clickedAlarm.creationTime ||
            clickedAlarm.status !== AlarmStatus.CLEARED
              ? timeRange.dateTo
              : clickedAlarm['lastUpdated'],
        },
      ];
    });
  }

  private getMarkedLineData(clickedAlarms: IAlarm[]) {
    return clickedAlarms.reduce<MarkLineData[]>((acc, alarm) => {
      const isClickedAlarmCleared = alarm.status === AlarmStatus.CLEARED;
      if (isClickedAlarmCleared) {
        return acc.concat([
          {
            xAxis: alarm.creationTime,
            itemType: alarm.type,
            label: {
              show: false,
              formatter: () => alarm.type,
            },
            itemStyle: { color: alarm['color'] },
          },
          {
            xAxis: alarm['lastUpdated'],
            itemType: alarm.type,
            label: {
              show: false,
              formatter: () => alarm.type,
            },
            itemStyle: { color: alarm['color'] },
          },
        ]);
      }
      return acc.concat([
        {
          xAxis: alarm.creationTime,
          itemType: alarm.type,
          label: {
            show: false,
            formatter: () => alarm.type,
          },
          itemStyle: { color: alarm['color'] },
        },
      ]);
    }, []);
  }

  private async loadAlarms(customTimeRange?: any): Promise<IAlarm[] | []> {
    const timeRange = this.getTimeRange();
    const updatedTimeRange = {
      lastUpdatedFrom: customTimeRange
        ? customTimeRange.dateFrom
        : timeRange.dateFrom,
      createdTo: customTimeRange ? customTimeRange.dateTo : timeRange.dateTo,
    };
    if (!this.config.alarmsEventsConfigs) return [];
    const visibleAlarmsOrEvents = this.config.alarmsEventsConfigs?.filter(
      (alarmOrEvent) => !alarmOrEvent.__hidden && alarmOrEvent.__active
    );
    const alarms = visibleAlarmsOrEvents?.filter(
      (alarmOrEvent) => alarmOrEvent.timelineType === 'ALARM'
    ) as AlarmDetailsExtended[];
    const events = visibleAlarmsOrEvents?.filter(
      (alarmOrEvent) => alarmOrEvent.timelineType === 'EVENT'
    ) as EventDetailsExtended[];

    const [listedEvents, listedAlarms] = await Promise.all([
      this.chartEventsService.listEvents(updatedTimeRange, events),
      this.chartAlarmsService.listAlarms(updatedTimeRange, alarms),
    ]);

    return listedAlarms;
  }

  private async loadAlarmsAndEvents(customTimeRange?: any): Promise<void> {
    const timeRange = this.getTimeRange();
    const updatedTimeRange = {
      lastUpdatedFrom: customTimeRange
        ? customTimeRange.dateFrom
        : timeRange.dateFrom,
      createdTo: customTimeRange ? customTimeRange.dateTo : timeRange.dateTo,
    };
    if (!this.config.alarmsEventsConfigs) return;
    const visibleAlarmsOrEvents = this.config.alarmsEventsConfigs?.filter(
      (alarmOrEvent) => !alarmOrEvent.__hidden && alarmOrEvent.__active
    );
    const alarms = visibleAlarmsOrEvents?.filter(
      (alarmOrEvent) => alarmOrEvent.timelineType === 'ALARM'
    ) as AlarmDetailsExtended[];
    const events = visibleAlarmsOrEvents?.filter(
      (alarmOrEvent) => alarmOrEvent.timelineType === 'EVENT'
    ) as EventDetailsExtended[];

    const [listedEvents, listedAlarms] = await Promise.all([
      this.chartEventsService.listEvents(updatedTimeRange, events),
      this.chartAlarmsService.listAlarms(updatedTimeRange, alarms),
    ]);

    this.events = listedEvents;
    this.alarms = listedAlarms;
    await this.addActiveAlarms(alarms);

    this.updateAlarmsAndEvents.emit(this.config.alarmsEventsConfigs);
  }

  private startRealtimeIfPossible(): void {
    const activeDatapoints = this.config?.datapoints?.filter(
      (dp) => dp.__active
    );
    if (activeDatapoints && this.config.realtime && this.echartsInstance) {
      this.chartRealtimeService.startRealtime(
        this.echartsInstance,
        activeDatapoints,
        this.getTimeRange(),
        (dp) => this.datapointOutOfSync.emit(dp),
        (timeRange) => this.timeRangeChangeOnRealtime.emit(timeRange),
        this.config.alarmsEventsConfigs,
        {
          displayMarkedLine: this.config.displayMarkedLine || false,
          displayMarkedPoint: this.config.displayMarkedPoint || false,
        }
      );
    }
  }

  /*
  This method should check and add active alarms from the begining of time to the alarm array
  */
  private async addActiveAlarms(alarms: AlarmDetailsExtended[]): Promise<void> {
    const timeRange = this.getTimeRange();
    const params = {
      dateFrom: '1970-01-01T01:00:00+01:00',
      dateTo: timeRange.dateTo,
      status: AlarmStatus.ACTIVE,
    };

    const activeAlarms = await this.chartAlarmsService.listAlarms(
      params,
      alarms
    );
    this.config.activeAlarmTypesOutOfRange = [];
    // iterate through the activeAlarms and check if the alarm is in the alarms array, if not update the config.activeAlarmTypesOutOfRange prop
    activeAlarms.forEach((activeAlarm) => {
      const alarmType = activeAlarm.type;
      const alarm = this.alarms.find((alarm) => alarm.type === alarmType);
      if (!alarm && this.config.activeAlarmTypesOutOfRange) {
        this.config.activeAlarmTypesOutOfRange.push(alarmType);
      }
    });
  }

  private updateZoomState(): void {
    const dataZoom: any = this.echartsInstance.getOption()['dataZoom'];
    const { startValue, endValue }: DataZoomOption = dataZoom[0];
    if (startValue && endValue) {
      this.zoomHistory.push({ startValue, endValue });
    }
  }

  private async getChartOptions(
    datapointsWithValues: DatapointWithValues[]
  ): Promise<EChartsOption> {
    const timeRange = this.getTimeRange();

    if (!this.initialTimeRange) {
      this.initialTimeRange = timeRange;

      const aggregatedDatapoints = await lastValueFrom(
        this.fetchSeriesForDatapoints$({
          dateFrom: new Date(
            new Date(timeRange.dateFrom).valueOf() - 5 * 60 * 60 * 1000
          ).toISOString(),
          dateTo: timeRange.dateTo,
        })
      );
      return this.echartsOptionsService.getChartOptions(
        datapointsWithValues,
        timeRange,
        {
          YAxis: this.config.yAxisSplitLines || false,
          XAxis: this.config.xAxisSplitLines || false,
        },
        this.events,
        this.alarms,
        {
          displayMarkedLine: this.config.displayMarkedLine || false,
          displayMarkedPoint: this.config.displayMarkedPoint || false,
        },
        undefined,
        aggregatedDatapoints
      );
    } else {
      const aggregatedDatapoints = await lastValueFrom(
        this.fetchSeriesForDatapoints$({
          dateFrom: new Date(
            new Date(this.initialTimeRange.dateFrom).valueOf() -
              5 * 60 * 60 * 1000
          ).toISOString(),
          dateTo: this.initialTimeRange.dateTo,
        })
      );
      return this.echartsOptionsService.getChartOptions(
        datapointsWithValues,
        this.initialTimeRange,
        {
          YAxis: this.config.yAxisSplitLines || false,
          XAxis: this.config.xAxisSplitLines || false,
        },
        this.events,
        this.alarms,
        {
          displayMarkedLine: this.config.displayMarkedLine || false,
          displayMarkedPoint: this.config.displayMarkedPoint || false,
        },
        timeRange,
        aggregatedDatapoints
      );
    }
  }

  private fetchSeriesForDatapoints$(
    customTimeRange?: any
  ): Observable<DatapointWithValues[]> {
    const activeDatapoints = this.config?.datapoints?.filter(
      (dp) => dp.__active
    );
    if (!activeDatapoints || activeDatapoints.length === 0) {
      return of([]);
    }
    const datapointsWithValuesRequests: Observable<DatapointWithValues>[] = [];
    const timeRange = this.getTimeRange(60_000);
    for (const dp of activeDatapoints) {
      const request = this.measurementService
        .listSeries$({
          ...(customTimeRange ? customTimeRange : timeRange),
          source: dp.__target?.id || '',
          series: [`${dp.fragment}.${dp.series}`],
          ...(this.config.aggregation && {
            aggregationType: customTimeRange
              ? aggregationType.HOURLY
              : this.config.aggregation,
          }),
        })
        .pipe(
          map((res) => {
            const values = res.data.values;
            if (res.data.truncated && this.config.dateFrom) {
              values[this.config.dateFrom.toISOString()] = [
                { min: null, max: null },
              ];
            } else {
              this.alerts.clear();
            }
            return { ...dp, values, truncated: res.data.truncated };
          })
        );

      datapointsWithValuesRequests.push(request);
    }
    return forkJoin(datapointsWithValuesRequests).pipe(
      tap((dpsWithValues: DatapointWithValues[]) => {
        if (dpsWithValues.some((dp) => dp['truncated'])) {
          this.addTruncatedDataAlert();
        }
      })
    );
  }

  private addTruncatedDataAlert(): void {
    if (
      this.alerts.alertGroups.find((a) => a.type === 'warning')?.value?.alerts
        ?.length
    ) {
      return;
    }
    const alert = new DynamicComponentAlert({
      type: 'warning',
      text: this.translateService.instant(
        gettext(
          'Truncated data. Change aggregation or select shorter date range.'
        )
      ),
    });

    this.alerts.addAlerts(alert);
  }

  private getTimeRange(additionalPadding?: number): {
    dateFrom: string;
    dateTo: string;
  } {
    let timeRange: { dateFrom: Date; dateTo: Date };
    if (
      this.config.widgetInstanceGlobalTimeContext ||
      (this.config.interval === 'custom' && !this.config.realtime)
    ) {
      timeRange = {
        dateFrom: new Date(this.config.dateFrom as Date),
        dateTo: new Date(this.config.dateTo as Date),
      };
    } else {
      let timeRangeInMs: number = 0;
      if (this.config.interval && this.config.interval !== 'custom') {
        timeRangeInMs =
          INTERVALS.find((i) => i.id === this.config.interval)?.timespanInMs ||
          0;
      } else if (this.config.realtime) {
        timeRangeInMs =
          new Date(this.config.dateTo as Date).valueOf() -
          new Date(this.config.dateFrom as Date).valueOf();
      }
      const now = new Date();
      timeRange = {
        dateFrom: new Date(now.valueOf() - timeRangeInMs),
        dateTo: now,
      };
    }
    if (additionalPadding) {
      timeRange.dateFrom = new Date(
        timeRange.dateFrom.valueOf() - additionalPadding
      );
      timeRange.dateTo = new Date(
        timeRange.dateTo.valueOf() + additionalPadding
      );
    }
    return {
      dateFrom: timeRange.dateFrom.toISOString(),
      dateTo: timeRange.dateTo.toISOString(),
    };
  }
}
