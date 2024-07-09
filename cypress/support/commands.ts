export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      interceptCurrentUser(customRoles?: string[]): Chainable<void>;
      interceptCurrentTenant(): Chainable<void>;
      interceptLoginOptions(): Chainable<void>;
      interceptAppManifest(): Chainable<void>;
      interceptAppManifest(): Chainable<void>;
      /**
       * Below is the overwritten cy.request command with custom headers
       * @param {object} originalFn - Original request fn
       * @param {string} args - list of parameters needed for making cy.request
       * @example cy.request('/inventory/managedObjects', 'POST', deviceObjCopy);
       */
      request(originalFn: object, ...args: string[]): Chainable<any>;
      acceptCookieBanner(
        required: boolean,
        functional: boolean
      ): Chainable<void>;
      login2(username: string, password: string): Chainable<any>;
      getTenantId2(username: string, password: string): Chainable<string>;
      prepareGroupWithDashboard(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('acceptCookieBanner', (required, functional) => {
  const COOKIE_NAME = 'acceptCookieNotice';
  const COOKIE_VALUE = `{"required":${required},"functional":${functional}}`;
  Cypress.on('window:before:load', (window) => {
    window.localStorage.setItem(COOKIE_NAME, COOKIE_VALUE);
  });
});

Cypress.Commands.add('getTenantId2', (username, password) => {
  cy.request({
    method: 'GET',
    url: '/tenant/currentTenant',
    auth: {
      username,
      password,
    },
  }).then((response) => response.body.name);
});

Cypress.Commands.add('login2', (username, password) => {
  cy.acceptCookieBanner(true, true);
  cy.session(
    username,
    () => {
      cy.getTenantId2(username, password).then((tenantId) => {
        cy.request({
          method: 'POST',
          url: `/tenant/oauth?tenant_id=${tenantId}`,
          body: {
            grant_type: 'PASSWORD',
            username,
            password,
            tfa_code: undefined,
          },
          form: true,
        }).then((resp) => {
          expect(resp.status).to.eq(200);
          expect(resp).to.have.property('headers');
        });
      });
    },
    {
      validate() {
        cy.request('/user/currentUser').its('status').should('eq', 200);
      },
      cacheAcrossSpecs: true,
    }
  );
});

Cypress.Commands.add('interceptCurrentUser', (customRoles?: string[]) => {
  const defaultRoles = [
    'ROLE_TENANT_ADMIN',
    'ROLE_TENANT_MANAGEMENT_ADMIN',
    'ROLE_TENANT_MANAGEMENT_READ',
    'ROLE_ALARM_ADMIN',
    'ROLE_ALARM_READ',
    'ROLE_AUDIT_ADMIN',
    'ROLE_AUDIT_READ',
    'ROLE_DEVICE_CONTROL_ADMIN',
    'ROLE_DEVICE_CONTROL_READ',
    'ROLE_EVENT_ADMIN',
    'ROLE_EVENT_READ',
    'ROLE_IDENTITY_ADMIN',
    'ROLE_IDENTITY_READ',
    'ROLE_INVENTORY_ADMIN',
    'ROLE_INVENTORY_READ',
    'ROLE_INVENTORY_CREATE',
    'ROLE_MEASUREMENT_ADMIN',
    'ROLE_MEASUREMENT_READ',
    'ROLE_APPLICATION_MANAGEMENT_ADMIN',
    'ROLE_APPLICATION_MANAGEMENT_READ',
    'ROLE_OPTION_MANAGEMENT_ADMIN',
    'ROLE_OPTION_MANAGEMENT_READ',
  ];
  const roles = customRoles || defaultRoles;
  const roleReferences = roles.map((roleId) => ({
    role: { name: roleId, id: roleId },
  }));
  const user = {
    roles: {
      references: roleReferences,
    },
    passwordStrength: 'GREEN',
    displayName: 'Max',
    enabled: true,
    devicePermissions: {},
    supportUserEnabled: false,
    id: 'Max',
    email: 'max@example.com',
    shouldResetPassword: false,
    userName: 'Max',
    customProperties: { userOrigin: 'BASIC' },
    phone: '',
    applications: [],
  };
  cy.intercept('/user/currentUser', (req) => {
    req.reply(user);
  }).as('currentUser');
});

Cypress.Commands.add('interceptCurrentTenant', () => {
  cy.intercept('/tenant/currentTenant', (req) => {
    req.reply({
      allowCreateTenants: true,
      customProperties: { gainsightEnabled: false },
      domainName: 'test.example.com',
      name: 'test',
      applications: {
        references: [],
      },
    });
  }).as('currentTenant');
});

Cypress.Commands.add('interceptLoginOptions', () => {
  cy.intercept('/tenant/loginOptions', (req) => {
    req.reply({
      loginOptions: [],
    });
  }).as('loginOptions');
});

Cypress.Commands.add('interceptAppManifest', () => {
  cy.intercept(
    '/application/applications/sag-pkg-community-plugins/manifest',
    (req) => {
      req.reply((res) => {
        res.send(404);
      });
    }
  ).as('appManifest');
});

Cypress.Commands.add('interceptAppManifest', () => {
  cy.intercept(
    '/application/applications/sag-pkg-community-plugins/manifest',
    (req) => {
      req.reply((res) => {
        res.send(404);
      });
    }
  ).as('appManifest');
});

Cypress.Commands.overwrite('request', (originalFn, ...args) => {
  let defaults;
  cy.getCookie('XSRF-TOKEN').then((cookie) => {
    if (!cookie) {
      defaults = {};
    } else if ((args[0] as any).headers) {
      defaults = Cypress._.merge(args[0], {
        headers: { 'X-XSRF-TOKEN': cookie.value },
      });
    } else {
      defaults = {
        headers: {
          'X-XSRF-TOKEN': cookie.value,
          'Content-Type': 'application/json',
        },
      };
    }
    let options = {} as any;
    if (Cypress._.isObject(args[0])) {
      options = Object.assign({}, args[0]);
    } else if (args.length === 1) {
      [options.url] = args;
    } else if (args.length === 2) {
      [options.url, options.method] = args;
    } else if (args.length === 3) {
      [options.url, options.method, options.body] = args;
    }
    return originalFn(Object.assign({}, defaults, options));
  });
});

Cypress.Commands.add('prepareGroupWithDashboard', () => {
  cy.request({
    url: '/inventory/managedObjects',
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: {
      c8y_IsDeviceGroup: {},
      c8y_Notes: '',
      name: 'e2eCopyGroup',
      type: 'c8y_DeviceGroup',
    },
  }).then((groupRes) => {
    cy.request({
      url: `/inventory/managedObjects/${groupRes.body.id}/childAdditions`,
      method: 'POST',
      headers: {
        'Content-Type':
          'application/vnd.com.nsn.cumulocity.managedobject+json;',
        Accept: 'application/json',
      },
      body: {
        name: 'e2eDashboard',
        [`c8y_Dashboard!group!${groupRes.body.id}`]: {},
        c8y_Dashboard: {
          name: 'e2eDashboard',
          priority: 10000,
          icon: 'th',
          translateWidgetTitle: true,
          children: {
            '1': {
              componentId: 'datapoints-graph',
              classes: {
                'alerts-overlay': false,
                'card-dashboard': true,
                'panel-title-regular': true,
                map: true,
                card: true,
              },
              _x: 0,
              _y: 0,
              id: '1',
              title: 'Data points graph',
              _width: 12,
              config: {
                datapoints: [],
                displayDateSelection: false,
                displayAggregationSelection: false,
                widgetInstanceGlobalTimeContext: false,
                canDecoupleGlobalTimeContext: false,
                dateFrom: '2023-04-27T12:00:00.000Z',
                dateTo: '2023-04-27T12:10:00.000Z',
                interval: 'hours',
                aggregation: null,
                realtime: true,
                yAxisSplitLines: false,
                xAxisSplitLines: false,
              },
              _height: 6,
            },
          },
          classes: { 'dashboard-theme-light': true },
          c8y_IsNavigatorNode: null,
          widgetClasses: { 'panel-title-regular': true },
        },
      },
    }).then((dashboardRes) => {
      cy.visit(
        `/apps/cockpit/index.html?remotes=%7B"sag-pkg-community-plugins"%3A%5B"ExampleWidgetPluginModule"%2C"DatapointsGraphWidgetModule"%5D%7D#/group/${groupRes.body.id}/dashboard/${dashboardRes.body.id}`
      );
    });
  });
});
