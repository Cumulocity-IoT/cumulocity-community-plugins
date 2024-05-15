import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AlarmEventSelectionListComponent } from './alarm-event-selection-list/alarm-event-selection-list.component';
import { CoreModule } from '@c8y/ngx-components';
import { AlarmEventSelectorListItemComponent } from './alarm-event-selector-list-item/alarm-event-selector-list-item.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AlarmEventAttributesFormComponent } from './alarm-event-attributes-form/alarm-event-attributes-form.component';
import { AlarmEventSelectorModalComponent } from './alarm-event-selector-modal/alarm-event-selector-modal.component';
import { AlarmEventSelectorComponent } from './alarm-event-selector.component';
import { AssetSelectorModule } from '@c8y/ngx-components/assets-navigator';
import { IncludesAlarmOrEventPipe } from './pipes/includes-alarm.pipe';
import { SeverityIconPipe } from './pipes/severity-icon.pipe';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CustomAlarmEventFormComponent } from './custom-alarm-event-form/custom-alarm-event-form.component';

@NgModule({
  imports: [
    CoreModule,
    DragDropModule,
    PopoverModule,
    TooltipModule,
    AssetSelectorModule,
    BsDropdownModule,
  ],
  declarations: [
    AlarmEventSelectionListComponent,
    AlarmEventSelectorListItemComponent,
    AlarmEventAttributesFormComponent,
    AlarmEventSelectorModalComponent,
    AlarmEventSelectorComponent,
    IncludesAlarmOrEventPipe,
    SeverityIconPipe,
    CustomAlarmEventFormComponent,
  ],
  exports: [AlarmEventSelectionListComponent],
})
export class AlarmEventSelectorModule {}
