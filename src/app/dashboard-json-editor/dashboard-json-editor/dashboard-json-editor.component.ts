import { ContextDashboard } from '@c8y/ngx-components/context-dashboard/context-dashboard.model';
import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import {
  CommonModule,
  FormsModule,
  gettext,
  ModalLabels,
  ModalModule,
} from '@c8y/ngx-components';
import { EditorComponent } from '@c8y/ngx-components/editor';
import schema from '../kpi_config.json';
import Ajv from 'ajv';

function replacer(_key: any, value: any) {
  // Filtering out properties
  if (value === null) {
    return undefined;
  }
  return value;
}

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
      <button class="btn btn-default" type="button" (click)="validate()">
        Validate
      </button>
      <div *ngIf="errors().length">
        <p *ngFor="let error of errors()">{{ error }}</p>
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
  ajv = new Ajv({ verbose: true, allErrors: true });

  result: Promise<string> = new Promise((resolve) => {
    this._close = resolve;
  });

  errors: WritableSignal<string[]> = signal([]);

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

  validate() {
    const dashboard: ContextDashboard = JSON.parse(this.valueString);
    for (const [_, value] of Object.entries(dashboard.children!)) {
      const config = value.config;
      // removing null values as typescript jsom schema doesn't provide info about optional properties
      const configWithoutNulls = JSON.parse(JSON.stringify(config, replacer));

      const validate = this.ajv.compile(schema);

      validate(configWithoutNulls);
      this.errors.set(this.ajv.errorsText(validate.errors).split(','));
    }
  }
}
