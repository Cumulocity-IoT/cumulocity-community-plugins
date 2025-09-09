# Cumulocity community plugins

This package provides a number of plugins that are developed and maintained by the community.

## Prerequisites

- Node.js (version 20.11.1 or higher)
- npm (version 8.0.0 or higher)
- Angular CLI

## Setup and Development

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/Cumulocity-IoT/cumulocity-community-plugins.git
cd cumulocity-community-plugins
npm install
```

### 2. Building the Application

To build the application:

```bash
npm run build
# or
ng build
```

The build artifacts will be stored in the `dist/` directory.

### 3. Running with Shell Application

#### Development with Live Tenant

To run the plugins against a live Cumulocity tenant with shell application:

```bash
ng serve --shell <application-name> -u "https://my-tenant.com"
```

Replace `<application-name>` with your desired shell application (e.g., `cockpit`, `devicemanagement`) and `https://my-tenant.com` with your actual Cumulocity tenant URL. This will serve your plugins within the specified shell environment.

## `Example widget plugin`

A sample plugin for orientation purposes when developing your own plugin.

![Example widget plugin](screenshots/example-widget-plugin-screenshot.png?raw=true 'Data points graph screenshot')

## `Advanced simulator plugin`

A feature that allows you to create simulators with the help of Claude AI. You only need to go to the Devicemanagement > Simulators and see a new tab called "Add advanced simulator". If you provide then an Claude API Key and a short use-case of your simulator, the AI will generate a set of instructions that fit your simulation use-case.

> **Important**: You need a Anthropic Claude API Key to use this feature.

![Advanced simulator](screenshots/advanced-simulator-screenshot.png?raw=true 'Advanced simulator screenshot')

## `Application builder dashboard migration plugin`

A plugin that offers a button to migrate dashboards created via the deprecated [Application Builder app](https://github.com/Cumulocity-IoT/cumulocity-app-builder) to Cockpit reports.
The mentioned button can be found in the reports list in the Cockpit application once the plugin has been installed to the Cockpit app.

## Contributing

We follow the [Angular guidelines for commit messages](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit). A linting rule is ensuring that your commit messages follow these rules. You can also run `npm commit` for a helper tool to write your commit messages.

---

This tools are provided as-is and without warranty or support. They do not constitute part of the product suite. Users are free to use, fork and modify them, subject to the license agreement. While we welcome contributions, we cannot guarantee to include every contribution in the master project.

---

For more information you can Ask a Question in the [Forums](https://techcommunity.cumulocity.com/).
