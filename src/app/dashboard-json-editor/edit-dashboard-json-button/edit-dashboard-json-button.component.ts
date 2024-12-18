import { Component, inject, OnInit } from '@angular/core';
import {
  ActionBarModule,
  C8yTranslatePipe,
  ContextData,
  ContextRouteService,
  IconDirective,
} from '@c8y/ngx-components';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ContextDashboardManagedObject,
  ContextDashboardService,
} from '@c8y/ngx-components/context-dashboard';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DashboardJsonEditorComponent } from '../dashboard-json-editor/dashboard-json-editor.component';
import { cloneDeep } from 'lodash-es';
import { IManagedObject } from '@c8y/client';

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
  private contextDashboardService = inject(ContextDashboardService);

  async editDashboardJSON() {
    try {
      const modalRef = this.modalService.show(DashboardJsonEditorComponent, {
        class: 'modal-lg',
        initialState: {
          dashboardMO: this.dashboardMO,
          currentContext: this.contextData,
        },
        ariaDescribedby: 'modal-body',
        ariaLabelledBy: 'modal-title',
        ignoreBackdropClick: true,
        keyboard: false,
      }).content as DashboardJsonEditorComponent;
      const dashboardJSON = await modalRef.result;

      if (this.dashboardMO) {
        await this.updateDashboard(dashboardJSON);
      } else {
        // assuming that dashboard was pasted and saved, so new dashboard should be created
        this.contextDashboardService.copyClipboard = {
          dashboardId: '0', // TODO: how to get id of dashboardMO? currently we edit dashboard only (ContextDashboard)
          dashboard: JSON.parse(dashboardJSON),
          context: cloneDeep({
            context: this.contextData.context,
            // contextData: {}, TODO: how to get contextData of origin dashboard? it is needed to override e.g. datapooints target
            contextData: { name: '2xp 2xn #1', id: '25103612785' },
          }),
        };

        await this.contextDashboardService.pasteDashboard({
          context: this.contextData.context,
          contextData: this.contextData.contextData as IManagedObject,
        });
      }

      // TODO: find better way to refresh dashboard
      const route = this.activatedRoute.parent?.snapshot.url
        .map((segment) => segment.path)
        .join('/') as string;
      await this.router.navigateByUrl(route);

      const context = this.contextData.context.split('/')[0] as
        | 'device'
        | 'group';
      await this.router.navigateByUrl(
        `${context}/${this.contextData.contextData.id}/dashboard/${this.dashboardMO.id}`,
        {
          replaceUrl: true,
        }
      );
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

  private async updateDashboard(updatedDashboard: string) {
    try {
      const dashboardMO: ContextDashboardManagedObject = cloneDeep(
        this.dashboardMO
      );
      dashboardMO.c8y_Dashboard = JSON.parse(updatedDashboard);

      await this.contextDashboardService.update(dashboardMO, this.contextData);
    } catch (_) {
      // intended empty
    }
  }
}
