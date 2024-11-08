import { Injectable } from '@angular/core';
import {
  ApplicationService,
  IApplication,
  IManagedObject,
  InventoryService,
} from '@c8y/client';
import { AppStateService } from '@c8y/ngx-components';

export interface AppBuilderDashboardDetails {
  visibility: string;
  tabGroup: string;
  name: string;
  icon: string;
  id: string;
  app: IApplication;
}

@Injectable({
  providedIn: 'root',
})
export class AppBuilderDashboardMigrationService {
  readonly reportPrefix = 'c8y_Dashboard!name!report_';
  readonly identifier = 'migratedAppBuilderDashboardsToReport';

  constructor(
    private inventory: InventoryService,
    private application: ApplicationService,
    private appState: AppStateService
  ) {}

  async getNotMigratedAppBuilderDashboards() {
    const applicationBuilderDashboardsReferencedInApps =
      await this.getDashboardsConfiguredInApps();
    const applicationBuilderDashboardIds =
      applicationBuilderDashboardsReferencedInApps.map((d) => d.id);

    const { data: dashboards } = await this.inventory.list({
      fragmentType: 'c8y_Dashboard',
      pageSize: 2000,
    });

    const noReportDashboards = dashboards.filter(
      (dashboard) =>
        !Object.keys(dashboard).some((key) => key.startsWith(this.reportPrefix))
    );

    const dashboardsWithMarker = noReportDashboards.filter(
      (dashboard) =>
        Object.keys(dashboard).some(
          (key) =>
            key.startsWith('global!presales!') ||
            key === 'c8y_Dashboard!name!app-builder-db'
        ) || applicationBuilderDashboardIds.includes(dashboard.id)
    );

    const enhancedDashboardsWithDetails = dashboardsWithMarker.map(
      (dashboard) => {
        return {
          dashboard,
          appBuilderDetails: applicationBuilderDashboardsReferencedInApps.find(
            (d) => d.id === dashboard.id
          ),
        };
      }
    );
    return enhancedDashboardsWithDetails;
  }

  async migrateDashboard(
    dashboard: IManagedObject,
    details?: AppBuilderDashboardDetails
  ) {
    const { id, c8y_Dashboard: dashboardDetails } = dashboard;
    const { name, icon, priority } = dashboardDetails;

    const adjustedName =
      name || details?.name || 'Unnamed app builder dashboard';
    const nameWithPrefix = details
      ? `${details.app.name} - ${adjustedName}`
      : adjustedName;

    const { data: reportObject } = await this.inventory.create({
      name: nameWithPrefix,
      icon,
      priority,
      description: null,
      c8y_Report: {},
      [this.identifier]: {},
    });

    await this.inventory.update({
      id,
      [`${this.reportPrefix}${reportObject.id}`]: {},
      [this.identifier]: {},
    });
  }

  private async getDashboardsConfiguredInApps() {
    try {
      const { data: externalApps } = await this.application.list({
        tenant: this.appState.currentTenant.value?.name,
        type: 'EXTERNAL',
        pageSize: 2000,
      });

      const applicationBuilderDashboardsReferencedInApps: AppBuilderDashboardDetails[] =
        externalApps
          .map((a: any) => {
            const dashboards = a.applicationBuilder?.dashboards || [];
            return dashboards.map((d: any) => ({ ...d, app: a }));
          })
          .flat();

      return applicationBuilderDashboardsReferencedInApps;
    } catch (error) {
      console.warn(error);
      return [];
    }
  }
}
