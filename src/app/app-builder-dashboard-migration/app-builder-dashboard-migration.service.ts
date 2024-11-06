import { Injectable } from '@angular/core';
import { IManagedObject, InventoryService } from '@c8y/client';

@Injectable({
  providedIn: 'root',
})
export class AppBuilderDashboardMigrationService {
  readonly reportPrefix = 'c8y_Dashboard!name!report_';
  readonly identifier = 'migratedAppBuilderDashboardsToReport';

  constructor(private inventory: InventoryService) {}

  async getNotMigratedAppBuilderDashboards() {
    const { data: dashboards } = await this.inventory.list({
      fragmentType: 'c8y_Dashboard',
      pageSize: 2000,
    });

    const noReportDashboards = dashboards.filter(
      (dashboard) =>
        !Object.keys(dashboard).some((key) => key.startsWith(this.reportPrefix))
    );

    const dashboardsWithMarker = noReportDashboards.filter((dashboard) =>
      Object.keys(dashboard).some(
        (key) =>
          key.startsWith('global!presales!') ||
          key === 'c8y_Dashboard!name!app-builder-db'
      )
    );
    return dashboardsWithMarker;
  }

  async migrateDashboard(dashboard: IManagedObject) {
    const { id, c8y_Dashboard: dashboardDetails } = dashboard;
    const { name, icon, priority } = dashboardDetails;

    const { data: reportObject } = await this.inventory.create({
      name: name || 'Unnamed app builder dashboard',
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
}
