import { IIdentified } from '@c8y/client';

export type TimelineType = 'ALARM' | 'EVENT';

export type AlarmSelectorModalOptions = {
  contextAsset: IIdentified;
};

export type AlarmOrEvent = {
  timelineType: TimelineType;
  color: string;
  __active: boolean;
  label: string;
  filters: {
    type: string;
  };
  __target: IIdentified;
};

export type AlarmDetails = AlarmOrEvent & {
  timelineType: 'ALARM';
};

export type EventDetails = AlarmOrEvent & {
  timelineType: 'EVENT';
};