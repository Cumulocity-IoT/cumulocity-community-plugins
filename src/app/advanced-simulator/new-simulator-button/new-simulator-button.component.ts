import { Component, inject } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute } from '@angular/router';
import { SimulatorModalComponent } from '../simulator-modal/simulator-modal.component';

@Component({
  selector: 'c8y-new-subscription-button',
  template: `
    <c8y-action-bar-item [placement]="'right'">
      <button
        class="btn btn-link"
        title="{{ 'Add advanced simulator' | translate }}"
        (click)="addSimulator()"
      >
        <i c8yIcon="send"></i>
        {{ 'Add advanced simulator' | translate }}
      </button>
    </c8y-action-bar-item>
  `,
  standalone: false,
})
export class NewSimulatorButtonComponent {
  modalService = inject(BsModalService);
  route = inject(ActivatedRoute);

  async addSimulator() {
    try {
      const modalRef = this.modalService.show(SimulatorModalComponent, {
        ariaDescribedby: 'modal-body',
        ariaLabelledBy: 'modal-title',
        ignoreBackdropClick: true,
      }).content as SimulatorModalComponent;
      await modalRef.result;
    } catch (_) {
      return;
    }
  }
}
