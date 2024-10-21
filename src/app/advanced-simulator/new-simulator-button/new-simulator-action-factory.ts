import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ActionBarFactory, ActionBarItem } from '@c8y/ngx-components';
import { NewSimulatorButtonComponent } from './new-simulator-button.component';

@Injectable()
export class NewSimulatorActionBarFactory implements ActionBarFactory {
  router = inject(Router);

  get() {
    if (this.router.url.includes(`/simulators`)) {
      const action: ActionBarItem = {
        placement: 'right',
        priority: -10,
        component: NewSimulatorButtonComponent,
      };
      return [action];
    }
    return [];
  }
}
