import { NgModule } from '@angular/core';
import { hookActionBar } from '@c8y/ngx-components';
import { EditDashboardJsonActionBarFactory } from './edit-dashboard-json-button/edit-dashboard-json-action-factory';

@NgModule({
  providers: [hookActionBar(EditDashboardJsonActionBarFactory)],
})
export class DashboardJsonEditorModule {}
