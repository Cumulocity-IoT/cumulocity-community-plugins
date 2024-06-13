import { Injectable } from '@angular/core';
import { EventService, IEvent, IFetchOptions, IResultList } from '@c8y/client';
import { EventDetails } from '../alarm-event-selector';

@Injectable()
export class ChartEventsService {
  constructor(private eventService: EventService) {}

  async listEvents(params?, events?: EventDetails[]): Promise<IEvent[]> {
    if (!events) {
      return [];
    }
    const promises = events.map((event) => {
      const fetchOptions: IFetchOptions = {
        source: event.__target.id,
        type: event.filters.type,
        withTotalPages: true,
        pageSize: 1000,
        ...params,
      };
      return this.eventService.list(fetchOptions).then((result) => {
        result.data.forEach((iEvent) => {
          iEvent.color = event.color;
        });
        return result.data;
      });
    });
    const result = await Promise.all(promises);
    return result.flat();
  }
}
