import { ContextDashboard } from '@c8y/ngx-components/context-dashboard/context-dashboard.model';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {
  CommonModule,
  ContextData,
  DynamicComponentService,
  FormsModule,
  gettext,
  ModalLabels,
  ModalModule,
} from '@c8y/ngx-components';
import { EditorComponent } from '@c8y/ngx-components/editor';
import kpiSchema from './kpi.widget.json';
import dashboardSchema from './dashboard_config.json';
import modalResult from './modal_result.json';
import alarmListSchema from './alarm-list.widget.json';
import Ajv from 'ajv';
import { debounceTime } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { ContextDashboardManagedObject } from '@c8y/ngx-components/context-dashboard';
import { defaultWidgetIds } from '@c8y/ngx-components/widgets/definitions';
import { AnyValidateFunction } from 'ajv/dist/types';
import addFormats from 'ajv-formats';

function replacer(_key: any, value: any) {
  // Filtering out properties
  if (value === null) {
    return undefined;
  }
  return value;
}

export const Schemas = {
  dashboard: 'dashboard',
  kpiWidget: 'kpiWidget',
  alarmListSchema: 'alarmListSchema',
  dataPointsGraph: 'dataPointsGraph',
} as const;

export type EditorModalResult = {
  c8y_Dashboard: ContextDashboard;
  metadata: {
    currentTenant: string;
  };
};

@Component({
  selector: 'c8y-dashboard-json-editor',
  template: `
    <c8y-modal
      [title]="'Edit dashboard JSON'"
      [headerClasses]="'dialog-header'"
      [labels]="labels"
      (onClose)="onSave()"
      (onDismiss)="onDismiss()"
    >
      <div [ngStyle]="{ height: '350px' }" class="d-flex">
        <c8y-editor
          class="flex-grow"
          [ngModel]="valueString"
          (ngModelChange)="dashboardJSONChange($event)"
          (editorInit)="assignSchema()"
          monacoEditorMarkerValidator
        ></c8y-editor>
      </div>
      <div *ngIf="dashboardErrors().length">
        <strong>Dashboard errors:</strong>
        <p *ngFor="let error of dashboardErrors()">{{ error }}</p>
      </div>
      <div *ngIf="widgetErrors().length">
        <strong>Widget errors:</strong>
        <p *ngFor="let error of widgetErrors()">{{ error }}</p>
      </div>
      <div *ngIf="contextErrors().length">
        <strong>Context errors:</strong>
        <p *ngFor="let error of contextErrors()">{{ error }}</p>
      </div>
    </c8y-modal>
  `,
  standalone: true,
  imports: [ModalModule, CommonModule, EditorComponent, FormsModule],
})
export class DashboardJsonEditorComponent implements OnInit, OnDestroy {
  @ViewChild(EditorComponent) editorComponent!: EditorComponent;
  dashboardMO!: ContextDashboardManagedObject;
  currentContext!: ContextData;
  currentTenant!: string;
  valueString = '';
  labels: ModalLabels = { ok: gettext('Save'), cancel: gettext('Cancel') };

  // TODO: ajv should be singleton (recommendation from docs), so separate service necessary
  ajv = new Ajv({ verbose: true, allErrors: true });

  result: Promise<EditorModalResult> = new Promise((resolve) => {
    this._close = resolve;
  });

  dashboardErrors: WritableSignal<string[]> = signal([]);
  widgetErrors: WritableSignal<string[]> = signal([]);
  contextErrors: WritableSignal<string[]> = signal([]);

  private validate$ = new Subject<string>();
  private _close: ((value: EditorModalResult) => void) | undefined;
  private modalRef = inject(BsModalRef);
  private destroy$ = new Subject<void>();

  private service = inject(DynamicComponentService);
  private schema2: any;

  async ngOnInit() {
    addFormats(this.ajv as any);

    const def1 = await this.service.getById('datapoints-graph');
    const schema1 = await def1.data.schema();
    console.log('Loaded schema generated datapoints graph', schema1);

    const def2 = await this.service.getById(defaultWidgetIds.KPI);
    this.schema2 = await def2.data.schema();
    console.log('Loaded schema KPI:', this.schema2);

    const value = {
      c8y_Dashboard: this.dashboardMO?.c8y_Dashboard || {},
      metadata: {
        currentTenant: this.currentTenant,
      },
    };
    this.valueString = JSON.stringify(value);
    this.ajv.addSchema(this.schema2, Schemas.kpiWidget);
    this.ajv.addSchema(schema1, Schemas.dataPointsGraph);
    console.log('kpiSchema local', kpiSchema);
    this.ajv.addSchema(alarmListSchema, Schemas.alarmListSchema);
    this.ajv.addSchema(dashboardSchema, Schemas.dashboard);

    this.validate$
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => this.validate());
  }

  assignSchema() {
    console.log('assignSchema', this.editorComponent.monaco);
    this.editorComponent.monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
      {
        validate: true,
        schemas: [
          {
            uri: './modal_result.json',
            fileMatch: ['*'],
            schema: modalResult,
          },
          {
            uri: 'kpi-widget-schema',
            schema: this.schema2,
          },
          {
            uri: 'alarm-list-widget-schema',
            schema: alarmListSchema,
          },
        ],
        enableSchemaRequest: false,
        allowComments: false,
      }
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dashboardJSONChange(value: string) {
    this.valueString = value;
    this.validate$.next(value);
  }

  async onSave() {
    const result: EditorModalResult = JSON.parse(this.valueString);
    this._close!(result);
    this.modalRef.hide();
  }

  onDismiss() {
    this.modalRef.hide();
  }

  validate() {
    const dashboard: ContextDashboard = JSON.parse(
      this.valueString
    ).c8y_Dashboard;
    const tenant = JSON.parse(this.valueString).metadata.currentTenant;
    this.validateDashboard(dashboard);
    this.validateWidgets(dashboard);
    this.validateContext(dashboard, tenant);
  }

  private validateDashboard(dashboard: ContextDashboard) {
    const validate = this.ajv.getSchema(Schemas.dashboard);
    // removing null values as typescript jsom schema doesn't provide info about optional properties
    const dashboardWithoutNulls = JSON.parse(
      JSON.stringify(dashboard, replacer)
    );

    validate?.(dashboardWithoutNulls);
    this.dashboardErrors.set(this.ajv.errorsText(validate?.errors).split(','));
  }

  private validateWidgets(dashboard: ContextDashboard) {
    this.widgetErrors.set([]);

    for (const [_, value] of Object.entries(dashboard.children!)) {
      const config = value.config;
      // removing null values as typescript jsom schema doesn't provide info about optional properties
      const configWithoutNulls = JSON.parse(JSON.stringify(config, replacer));

      let validate: AnyValidateFunction<unknown> | undefined;
      if (value.componentId === defaultWidgetIds.KPI) {
        validate = this.ajv.getSchema(Schemas.kpiWidget);
      } else if (value.componentId === defaultWidgetIds.ALARM_LIST) {
        validate = this.ajv.getSchema(Schemas.alarmListSchema);
      } else if (value.componentId === 'datapoints-graph') {
        validate = this.ajv.getSchema(Schemas.dataPointsGraph);
      }

      validate?.(configWithoutNulls);
      const errors = this.ajv
        .errorsText(validate?.errors)
        .split(',')
        .map((error) => `${value.title}: ${error}`);
      this.widgetErrors.set([...this.widgetErrors(), ...errors]);
    }
  }

  private validateContext(dashboard: ContextDashboard, tenant: string) {
    this.contextErrors.set([]);
    if (tenant === this.currentTenant) {
      return;
    }

    for (const [_, widget] of Object.entries(dashboard.children!)) {
      widget.config.datapoints.forEach((dp: any) => {
        this.contextErrors.set([
          ...this.contextErrors(),
          `${widget.title}: datapoint ${dp.label} needs device ${dp.__target.name} updated`,
        ]);
      });
    }
  }
}
