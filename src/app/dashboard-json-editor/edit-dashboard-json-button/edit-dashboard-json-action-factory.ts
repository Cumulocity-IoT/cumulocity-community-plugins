import { Injectable } from '@angular/core';
import { ActionBarFactory, ActionBarItem } from '@c8y/ngx-components';
import { EditDashboardJsonButtonComponent } from './edit-dashboard-json-button.component';

@Injectable()
export class EditDashboardJsonActionBarFactory implements ActionBarFactory {
  get() {
    const action: ActionBarItem = {
      placement: 'right',
      priority: -10,
      component: EditDashboardJsonButtonComponent,
    };
    return [action];
  }
}
