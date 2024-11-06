import { Component, OnInit } from '@angular/core';
import { AlertService, IconDirective } from '@c8y/ngx-components';
import { AppBuilderDashboardMigrationService } from '../app-builder-dashboard-migration.service';
import { IManagedObject } from '@c8y/client';

@Component({
  selector: 'li[app-app-builder-dashboard-migration-button]',
  templateUrl: './app-builder-dashboard-migration-button.component.html',
  standalone: true,
  imports: [IconDirective],
})
export class AppBuilderDashboardMigrationButtonComponent implements OnInit {
  dashboards: IManagedObject[] = [];
  constructor(
    private alert: AlertService,
    private migrationService: AppBuilderDashboardMigrationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.dashboards =
      await this.migrationService.getNotMigratedAppBuilderDashboards();
  }

  async migrateDashboards() {
    this.alert.info('Migrating dashboards...');
    for (const dashboard of this.dashboards) {
      await this.migrationService.migrateDashboard(dashboard);
    }
    this.alert.success(
      'Dashboards migrated successfully, please reload the page.'
    );
    this.dashboards = [];
  }
}
