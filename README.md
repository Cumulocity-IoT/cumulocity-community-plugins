# Cumulocity community plugins

This package provides a number of plugins that are developed and maintained by the community.

As of now it only consists of two widgets, but further plugins will be added soon.

## `Data points graph widget plugin`

A graph display of a collection of data points. Since release 3.0.0, compatible version of Cumulocity UI app are:
 - 1018.0.267 (1018.0-lts)
 - 1018.503.100 (y2024-lts)
 - 1020.0.19 (y2025-lts)

For release 2.1.6 and previous, compatible version of Cumulocity UI app are:
 - ~1016.0.214
 - ~1017.0.146
 - ~1018.0.45

![Data points graph screenshot](screenshots/datapoints-graph-screenshot.png?raw=true "Data points graph screenshot")

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

## Useful links 

📘 Explore the Knowledge Base   
Dive into a wealth of Cumulocity IoT tutorials and articles in our [Tech Community Knowledge Base](https://tech.forums.softwareag.com/tags/c/knowledge-base/6/cumulocity-iot).  

💡 Get Expert Answers    
Stuck or just curious? Ask the Cumulocity IoT experts directly on our [Forum](https://tech.forums.softwareag.com/tags/c/forum/1/Cumulocity-IoT).   

🚀 Try Cumulocity IoT    
See Cumulocity IoT in action with a [Free Trial](https://techcommunity.softwareag.com/en_en/downloads.html).   

✍️ Share Your Feedback    
Your input drives our innovation. If you find a bug, please create an issue in the repository. If you’d like to share your ideas or feedback, please post them [here](https://tech.forums.softwareag.com/c/feedback/2). 

More to discover
* [How to install a Microfrontend Plugin on a tenant and use it in an app?](https://tech.forums.softwareag.com/t/how-to-install-a-microfrontend-plugin-on-a-tenant-and-use-it-in-an-app/268981)  
* [Cumulocity IoT Web Development Tutorial - Part 1: Start your journey](https://tech.forums.softwareag.com/t/cumulocity-iot-web-development-tutorial-part-1-start-your-journey/259613) 
* [The power of micro frontends – How to dynamically extend Cumulocity IoT Frontends](https://tech.forums.softwareag.com/t/the-power-of-micro-frontends-how-to-dynamically-extend-cumulocity-iot-frontends/266665)  
---

This tool are provided as-is and without warranty or support. They do not constitute part of the Software AG product suite. Users are free to use, fork and modify them, subject to the license agreement. While Software AG welcomes contributions, we cannot guarantee to include every contribution in the master project.

