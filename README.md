# Cumulocity community plugins

This package provides a number of plugins that are developed and maintained by the community.

As of now it only consists of two widgets, but further plugins will be added soon.

## `Example widget plugin`

A sample plugin for orientation purposes when developing your own plugin.

![Example widget plugin](screenshots/example-widget-plugin-screenshot.png?raw=true "Data points graph screenshot")

## `Advanced simulator plugin`

A feature that allows you to create simulators with the help of Claude AI. You only need to go to the Devicemanagement > Simulators and see a new tab called "Add advanced simulator". If you provide then an Claude API Key and a short use-case of your simulator, the AI will generate a set of instructions that fit your simulation use-case.

 > **Important**: You need a Anthropic Claude API Key to use this feature.

![Advanced simulator](screenshots/advanced-simulator-screenshot.png?raw=true "Advanced simulator screenshot")

## `Application builder dashboard migration plugin`

A plugin that offers a button to migrate dashboards created via the deprecated [Application Builder app](https://github.com/Cumulocity-IoT/cumulocity-app-builder) to Cockpit reports.
The mentioned button can be found in the reports list in the Cockpit application once the plugin has been installed to the Cockpit app.


## Contributing

We follow the [Angular guidelines for commit messages](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit). A linting rule is ensuring that your commit messages follow these rules. You can also run `npm commit` for a helper tool to write your commit messages.

---

This tools are provided as-is and without warranty or support. They do not constitute part of the product suite. Users are free to use, fork and modify them, subject to the license agreement. While we welcome contributions, we cannot guarantee to include every contribution in the master project.

---

For more information you can Ask a Question in the [Forums](https://techcommunity.cumulocity.com/).
