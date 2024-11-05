import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionBarItem, ExtensionFactory } from '@c8y/ngx-components';
import { AppBuilderDashboardMigrationButtonComponent } from './app-builder-dashboard-migration-button/app-builder-dashboard-migration-button.component';
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppBuilderDashboardMigrationButtonService
  implements ExtensionFactory<ActionBarItem>
{
  get(
    activatedRoute?: ActivatedRoute
  ): Observable<ActionBarItem | ActionBarItem[]> {
    return (activatedRoute?.url || of([])).pipe(
      switchMap(async (url) => {
        if (url?.length !== 1 || url?.[0].path !== 'reports') {
          return false;
        }

        return true;
      }),
      distinctUntilChanged(),
      switchMap(async (show) => {
        if (!show) {
          return [];
        }

        return {
          component: AppBuilderDashboardMigrationButtonComponent,
          placement: 'right' as const,
        };
      })
    );
  }
}
