import { Injectable } from '@angular/core';
import { IManagedObject, InventoryService } from '@c8y/client';

@Injectable({
  providedIn: 'root',
})
export class AppBuilderDashboardMigrationService {
  readonly reportPrefix = 'c8y_Dashboard!name!report_';

  constructor(private inventory: InventoryService) {}

  async getNotMigratedAppBuilderDashboards() {
    const { data: dashboards } = await this.inventory.list({
      fragmentType: 'c8y_Dashboard!name!app-builder-db',
      pageSize: 2000,
    });

    return dashboards.filter(
      (dashboard) =>
        !Object.keys(dashboard).some((key) => key.startsWith(this.reportPrefix))
    );
  }

  async migrateDashboard(dashboard: IManagedObject) {
    const { id, c8y_Dashboard: dashboardDetails } = dashboard;
    const { name, icon, priority } = dashboardDetails;

    const { data: reportObject } = await this.inventory.create({
      name,
      icon,
      priority,
      description: null,
      c8y_Report: {},
    });

    await this.inventory.update({
      id,
      [`${this.reportPrefix}${reportObject.id}`]: {},
    });
  }
}
