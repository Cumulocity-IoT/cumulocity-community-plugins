import { Component, EventEmitter, Input, Output } from '@angular/core';
import { gettext } from '@c8y/ngx-components';

@Component({
  selector: 'c8y-realtime-control',
  templateUrl: './realtime-control.component.html',
  styleUrls: ['./realtime-control.less'],
  standalone: false,
})
export class RealtimeControlComponent {
  @Input() active: boolean;
  @Input() disabled = false;
  @Output() realtimeChange = new EventEmitter<boolean>();
  readonly disableRealtimeLabel = gettext('Disable realtime');
  readonly enableRealtimeLabel = gettext('Enable realtime');
}
