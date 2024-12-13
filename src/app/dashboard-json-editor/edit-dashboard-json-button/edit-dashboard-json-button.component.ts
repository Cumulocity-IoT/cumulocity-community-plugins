import { Component, inject, OnInit } from '@angular/core';
import {
  ActionBarModule,
  C8yTranslatePipe,
  ContextData,
  ContextRouteService,
  IconDirective,
} from '@c8y/ngx-components';
import { ActivatedRoute, Router } from '@angular/router';
import { ContextDashboardManagedObject } from '@c8y/ngx-components/context-dashboard';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DashboardJsonEditorComponent } from '../dashboard-json-editor/dashboard-json-editor.component';

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
export class EditDashboardJsonButtonComponent implements OnInit {
  private dashboardMO: ContextDashboardManagedObject =
    {} as ContextDashboardManagedObject;
  private contextData: ContextData = {} as ContextData;
  private activatedRoute!: ActivatedRoute;

  private router = inject(Router);
  private contextRouteService = inject(ContextRouteService);
  private modalService = inject(BsModalService);

  async editDashboardJSON() {
    try {
      const modalRef = this.modalService.show(DashboardJsonEditorComponent, {
        class: 'modal-lg',
        initialState: {
          dashboard: this.dashboardMO.c8y_Dashboard,
        },
        ariaDescribedby: 'modal-body',
        ariaLabelledBy: 'modal-title',
        ignoreBackdropClick: true,
        keyboard: false,
      }).content as DashboardJsonEditorComponent;
      const dashboardJSON = await modalRef.result;
      console.log(dashboardJSON);
    } catch (_) {
      return;
    }
  }

  ngOnInit() {
    this.activatedRoute = this.getActivatedRoute();
    this.activatedRoute.data.subscribe(({ dashboard }) => {
      this.dashboardMO = dashboard;
    });
    this.contextData = this.contextRouteService.activatedContextData;
  }

  /**
   * It is necessary to get the ActivatedRoute from the root of the router tree as
   * button component is outside router-outlet.
   * @private
   */
  private getActivatedRoute(): ActivatedRoute {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}
