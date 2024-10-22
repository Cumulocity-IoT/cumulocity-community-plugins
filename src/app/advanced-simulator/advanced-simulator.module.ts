import { NgModule } from '@angular/core';
import { NewSimulatorButtonComponent } from './new-simulator-button/new-simulator-button.component';
import { SimulatorModalComponent } from './simulator-modal/simulator-modal.component';
import { CoreModule, hookActionBar } from '@c8y/ngx-components';
import { NewSimulatorActionBarFactory } from './new-simulator-button/new-simulator-action-factory';

@NgModule({
  declarations: [NewSimulatorButtonComponent, SimulatorModalComponent],
  imports: [CoreModule],
  providers: [hookActionBar(NewSimulatorActionBarFactory)],
})
export class AdvancedSimulatorModule {}
