import { ContextDashboard } from '@c8y/ngx-components/context-dashboard/context-dashboard.model';
import { Component, inject, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {
  CommonModule,
  FormsModule,
  gettext,
  ModalLabels,
  ModalModule,
} from '@c8y/ngx-components';
import { EditorComponent } from '@c8y/ngx-components/editor';

@Component({
  selector: 'c8y-dashboard-json-editor',
  template: `
    <c8y-modal
      [title]="'Edit dashboard JSON'"
      [headerClasses]="'dialog-header'"
      [labels]="labels"
      (onClose)="onSave()"
      (onDismiss)="onDismiss()"
    >
      <div [ngStyle]="{ height: '500px' }" class="d-flex">
        <c8y-editor
          class="flex-grow"
          [(ngModel)]="valueString"
          monacoEditorMarkerValidator
        ></c8y-editor>
      </div>
    </c8y-modal>
  `,
  standalone: true,
  imports: [ModalModule, CommonModule, EditorComponent, FormsModule],
})
export class DashboardJsonEditorComponent implements OnInit {
  dashboard!: ContextDashboard;
  valueString = '';
  labels: ModalLabels = { ok: gettext('Save'), cancel: gettext('Cancel') };

  result: Promise<string> = new Promise((resolve) => {
    this._close = resolve;
  });

  private _close: ((value: string) => void) | undefined;
  private modalRef = inject(BsModalRef);

  ngOnInit(): void {
    this.valueString = JSON.stringify(this.dashboard);
  }

  onSave() {
    this._close!(this.valueString);
    this.modalRef.hide();
  }

  onDismiss() {
    this.modalRef.hide();
  }
}
