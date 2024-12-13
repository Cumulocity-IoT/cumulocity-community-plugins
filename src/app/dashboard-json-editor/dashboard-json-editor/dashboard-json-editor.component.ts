import { ContextDashboard } from '@c8y/ngx-components/context-dashboard/context-dashboard.model';
import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {
  CommonModule,
  gettext,
  ModalLabels,
  ModalModule,
} from '@c8y/ngx-components';

@Component({
  selector: 'c8y-dashboard-json-editor',
  template: `
    <c8y-modal
      [title]="'Edit dashboard JSON'"
      [headerClasses]="'dialog-header'"
      [labels]="labels"
      (onClose)="onDismiss()"
    >
      <div>
        <pre>{{ dashboard | json }}</pre>
      </div>
    </c8y-modal>
  `,
  standalone: true,
  imports: [ModalModule, CommonModule],
})
export class DashboardJsonEditorComponent {
  dashboard!: ContextDashboard;
  labels: ModalLabels = { ok: gettext('Close') };

  result: Promise<boolean> = new Promise((resolve) => {
    this._close = resolve;
  });

  private _close: ((value: boolean) => void) | undefined;
  private modalRef = inject(BsModalRef);

  onDismiss() {
    this._close!(true);
    this.modalRef.hide();
  }
}
