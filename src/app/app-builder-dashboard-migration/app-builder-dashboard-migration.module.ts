import { NgModule } from '@angular/core';
import { hookActionBar } from '@c8y/ngx-components';
import { AppBuilderDashboardMigrationButtonService } from './app-builder-dashboard-migration-button.service';

@NgModule({
  providers: [hookActionBar(AppBuilderDashboardMigrationButtonService)],
})
export class AppBuilderDashboardMigrationModule {}
