import { Component } from '@angular/core';
import {
  ActionBarModule,
  C8yTranslatePipe,
  IconDirective,
} from '@c8y/ngx-components';

@Component({
  selector: 'c8y-edit-dashboard-json-button',
  template: `
    <c8y-action-bar-item [placement]="'right'">
      <button
        class="btn btn-link"
        title="{{ 'Edit dashboard JSON' | translate }}"
        (click)="editDashboardJSON()"
      >
        <i c8yIcon="codefork"></i>
        {{ 'Edit dashboard JSON' | translate }}
      </button>
    </c8y-action-bar-item>
  `,
  standalone: true,
  imports: [C8yTranslatePipe, ActionBarModule, IconDirective],
})
export class EditDashboardJsonButtonComponent {
  editDashboardJSON() {
    console.log('Edit dashboard JSON');
  }
}
