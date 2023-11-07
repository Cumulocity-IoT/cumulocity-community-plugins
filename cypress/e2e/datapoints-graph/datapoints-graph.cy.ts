describe('datapoints-graph', () => {
  beforeEach(() => {
    cy.interceptLoginOptions();
    cy.interceptCurrentTenant();
    cy.interceptCurrentUser();

    cy.intercept(
      '/application/applications/sag-pkg-community-plugins/manifest',
      { fixture: 'manifest.json' }
    );

    cy.visit('/apps/sag-pkg-community-plugins/#/');
    cy.wait('@cockpitDashboardConfig', { timeout: 10000 });
  });

  it('view component should be present', () => {
    cy.get('c8y-datapoints-graph-widget-view').should('exist');
    cy.get('c8y-charts').should('exist');
  });

  it('config component should be present', () => {
    cy.get(
      'c8y-dashboard-child .header-actions button[title="Settings"]'
    ).click();
    cy.get(
      'c8y-dashboard-child .dropdown-menu button[title="Edit widget"]'
    ).click();
    cy.get('c8y-datapoints-graph-widget-config button.c8y-realtime')
      .find('.c8y-pulse.active')
      .should('exist');
  });
});
