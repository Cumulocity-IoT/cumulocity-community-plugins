export const PROMPT = `
You'll provide me multiple Cumulocity IoT simulators configuration for a
creating devices that will be used to create a digital twin of use case
scenario, based on this info:

-- Start info --

### Publish templates {#publish-templates}

The following templates can be used to publish data on the topics <kbd>s/us</kbd> as well as <kbd>t/us</kbd>. Refer to [Processing mode](/smartrest/smartrest-one/#processing-mode) for more information about the <kbd>t/</kbd> topic for transient data processing.

#### Inventory templates (1xx) {#inventory-templates}

##### Device creation (100) {#100}

Create a new device for the serial number in the inventory if not yet existing. An externalId for the device with type \`c8y_Serial\` and the device identifier of the MQTT clientId as value will be created.

|Position|Parameter  |Mandatory|Type  |Default value|
|:-------|:----------|:--------|:-----|:------------|
|1|device name|NO|String|MQTT Device <serialNumber>|
|2|device type|NO|String|c8y_MQTTDevice|

**Example**

\`\`\`text
100,myDevice,myType
\`\`\`

##### Child device creation (101) {#101}

Create a new child device for the current device. The newly created object will be added as child device. Additionally, an externaId for the child will be created with type \`c8y_Serial\` and the value a combination of the serial of the root device and the unique child ID.

|Position|Parameter|Mandatory|Type    |Default value|
|:-------|:--------|:--------|:-------|:------------|
|1|unique child ID|YES|String| &nbsp; |
|2|device name|NO|String|MQTT Device <serialNumber>|
|3|device type|NO|String|c8y_MQTTChildDevice|

**Example**

\`\`\`text
101,uniqueChildId,myChildDevice,myChildType
\`\`\`

##### Service creation (102) {#102}

Create a new software service for given device.

|Position|Parameter  |Mandatory|Type  |
|:-------|:----------|:--------|:-----|
|1|service unique external id|YES|String|
|2|service type|YES|String|
|3|service name|YES|String|
|4|service status|YES|String|

**Example**

\`\`\`text
102,myDatabaseDevice,systemd,DatabaseService,up
\`\`\`

##### Service status update (104) {#104}

Set a status for given software service.

|Position|Parameter  |Mandatory|Type  |
|:-------|:----------|:--------|:-----|
|1|service status|YES|String|

**Example**

\`\`\`text
104,up
\`\`\`

##### Get child devices (105) {#105}

Trigger the sending of child devices of the device.

**Example**

\`\`\`text
105
\`\`\`

##### Clear device's fragment (107) {#107}

Remove one or more fragments from a device.

|Position|Parameter|Mandatory|Type |
|:-------|:--------|:--------|:----|
|1...|fragmentName|YES|String|

**Example**

\`\`\`text
107,c8y_Position,c8y_Configuration
\`\`\`

##### Configure Hardware (110) {#110}

Update the hardware properties of the device.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|serialNumber|NO|String|
|2|model|NO|String|
|3|revision|NO|String|

**Example**

\`\`\`text
110,1234567890,myModel,1.2.3
\`\`\`

##### Configure Mobile (111) {#111}

Update the mobile properties of the device.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:----|
|1|imei|NO|String|
|2|iccid|NO|String|
|3|imsi|NO|String|
|4|mcc|NO|String|
|5|mnc|NO|String|
|6|lac|NO|String|
|7|cellId|NO|String|

**Example**

\`\`\`text
111,1234567890,,54353
\`\`\`

##### Configure Position (112) {#112}

Update the position properties of the device.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|latitude|NO|Number|
|2|longitude|NO|Number|
|3|altitude|NO|Number|
|4|accuracy|NO|Integer|

**Example**

\`\`\`text
112,50.323423,6.423423
\`\`\`

##### Set Configuration (113) {#113}

Update the configuration properties of the device.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|configuration|NO|String|

Example

\`\`\`text
113,"val1=1\\nval2=2"
\`\`\`

##### Set supported operations (114) {#114}

Set the supported operations of the device.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1...|List of supported operations|NO|String|

**Example**

\`\`\`text
114,c8y_Restart,c8y_Configuration,c8y_SoftwareList
\`\`\`

{{< c8y-admon-info >}}
If you want to remove an item from the supported operations list, send a new 114 request with the updated list, for example, \`114, c8y_Restart,c8y_Configuration\` in order to remove \`c8y_SoftwareList\` after the request from the example above.
{{< /c8y-admon-info >}}

##### Set firmware (115) {#115}

Set the firmware installed on the device.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|name|NO|String|
|2|version|NO|String|
|3|url|NO|String|

**Example**

\`\`\`text
115,firmwareName,firmwareVersion,firmwareUrl
\`\`\`

##### Set software list (116) {#116}

Set the list of software installed on the device.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1...|List of 3 values per software|NO|(n/a)|
|1.1|name|NO|String|
|1.2|version|NO|String|
|1.3|url|NO|String|

**Example**

\`\`\`text
116,software1,version1,url1,software2,,url2,software3,version3
\`\`\`

##### Set required availability (117) {#117}

Set the required interval for availability monitoring as an integer value representing minutes.
For more information, see *c8y_RequiredAvailability* in [Device availability](/device-integration/fragment-library/#device-availability).
This will only set the value if it does not exist. Values entered, for example, through the UI, are not overwritten.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|Required interval|NO|Integer|

**Example**

\`\`\`text
117,60
\`\`\`

##### Set supported logs (118) {#118}

Set the supported logs of the device.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1...|List of supported logs|NO|String|

**Example**

\`\`\`text
118,ntcagent,dmesg,logread
\`\`\`

##### Set supported configurations (119) {#119}

Set the supported configurations of the device.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1...|List of supported configurations|NO|String|

**Example**

\`\`\`text
119,modbus,system
\`\`\`

##### Set currently installed configuration (120) {#120}

Set currently installed configuration of the device.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|Configuration type|YES|String| &nbsp;|
|2|Configuration file download URL|YES|String| &nbsp;|
|3|File name|NO|String|Configuration type|
|4|Date and time when the configuration was applied|NO|Date|Current date and time|

**Example**

\`\`\`text
120,myType,http://www.my.url,config.bin,2020-07-22T17:03:14.000+02:00
\`\`\`

##### Set device profile that is being applied (121) {#121}

Set device profile that is being applied to the device.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|Profile executed|YES|String| &nbsp;|
|2|Profile ID|NO|String|Profile ID from the oldest EXECUTING device profile operation|

**Example**

\`\`\`text
121,true,8473
\`\`\`

##### Set device agent information (122) {#122}

Allows a device to provide information about the agent running on it.

| Position | Parameter              | Mandatory | Type   | Default value |
|:---------|:-----------------------|:----------|:-------|:--------------|
| 1        | Name of the agent      | YES       | String |               |
| 2        | Version of the agent   | YES       | String |               |
| 3        | The agent URL          | NO        | String |               |
| 4        | Maintainer of the agent| YES       | String |               |

**Example**

\`\`\`text
122,thin-edge.io,0.6,https://thin-edge.io,Software AG
\`\`\`

##### Send heartbeat (125) {#125}

Sends a heartbeat from the device to update its availability status.

**Example**

\`\`\`text
125
\`\`\`

##### Set advanced software list (140) {#140}

Sets the list of advanced software installed on the device. Any existing list will be overwritten.

| Position | Parameter               | Mandatory | Type   | Default value |
|:---------|:------------------------|:----------|:-------|:--------------|
| 1        | Name of the software    | YES       | String |               |
| 2        | Version of the software | YES       | String |               |
| 3        | Type of the software    | NO        | String |               |
| 4        | URL of the software     | NO        | String |               |

**Example**

\`\`\`text
140,docker,3.2.1,systemd,https://www.docker.com/,nginx,1.6,container,https://www.nginx.com/
\`\`\`

##### Get the device managed object ID (123) {#123}

Retrieve the ID of the device managed object.

**Example**

\`\`\`text
123
\`\`\`

##### Append advanced software items (141) {#141}

Appends advanced software items to the list that exists for the device.

| Position | Parameter               | Mandatory | Type   | Default value |
|:---------|:------------------------|:----------|:-------|:--------------|
| 1        | Name of the software    | YES       | String |               |
| 2        | Version of the software | YES       | String |               |
| 3        | Type of the software    | NO        | String |               |
| 4        | URL of the software     | NO        | String |               |

**Example**

\`\`\`text
141,docker,3.2.1,systemd,https://www.docker.com/,nginx,1.6,container,https://www.nginx.com/
\`\`\`

##### Remove advanced software items (142) {#142}

Removes advanced software items from the list that exists for the device.

| Position | Parameter               | Mandatory | Type   | Default value |
|:---------|:------------------------|:----------|:-------|:--------------|
| 1        | Name of the software    | YES       | String |               |
| 2        | Version of the software | YES       | String |               |

**Example**

\`\`\`text
142,docker,3.2.1,nginx,1.6
\`\`\`

##### Set supported software types (143) {#143}

Sets the supported software types of the device. Ignores empty elements. An empty list removes the \`c8y_SupportedSoftwareTypes\` fragment entirely.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1...|List of supported software types|NO|String|

**Example**

\`\`\`text
143,yum,docker
\`\`\`

##### Set supported software types (150) {#150}

Sets the list of Cloud Remote Access protocols supported by the device. Possible values are \`SSH\`,\`TELNET\`,\`VNC\` and \`PASSTHROUGH\`. Empty elements are ignored. An empty list removes the \`c8y_RemoteAccessSupportedProtocols\` fragment entirely.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1...|List of supported protocols|NO|String|

**Examples**

\`\`\`text
150,ssh,vnc
\`\`\`

#### Measurement templates (2xx) {#measurement-templates}

##### Create custom measurement (200) {#200}

Create a measurement with a given fragment and series.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|fragment|YES|String| &nbsp;|
|2|series|YES|String| &nbsp;|
|3|value|YES|Number| &nbsp;|
|4|unit|NO|String| &nbsp;|
|5|time|NO|Date|Current server time|

**Example**

\`\`\`text
200,c8y_Temperature,T,25
\`\`\`

##### Create a custom measurement with multiple fragments and series (201) {#201}

Create a measurement with multiple fragments and series.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|type|YES|String| &nbsp;|
|2|time|NO|Date| &nbsp;|
|3|List of 4 values per fragment-series combination|YES|(n/a)| &nbsp;|
|3.1|fragment|YES|String| &nbsp;|
|3.2|series|YES|String| &nbsp;|
|3.3|value|YES|Number| &nbsp;|
|3.4|unit|NO|String| &nbsp;|

**Example**

\`\`\`text
201,KamstrupA220Reading,2022-03-19T12:03:27.845Z,c8y_SinglePhaseEnergyMeasurement,A+:1,1234,kWh,c8y_SinglePhaseEnergyMeasurement,A-:1,2345,kWh,c8y_ThreePhaseEnergyMeasurement,A+:1,123,kWh,c8y_ThreePhaseEnergyMeasurement,A+:2,234,kWh,c8y_ThreePhaseEnergyMeasurement,A+:3,345,kWh
\`\`\`

##### Create signal strength measurement (210) {#210}

Create a measurement of type \`c8y_SignalStrength\`.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|rssi value|YES, if 2 not set|Number| &nbsp;|
|2|ber value|YES, if 1 not set|Number| &nbsp;|
|3|time|NO|Date|Current server time|

**Example**

\`\`\`text
210,-90,23,2016-06-22T17:03:14.000+02:00
\`\`\`

##### Create temperature measurement (211) {#211}

Create a measurement of type \`c8y_TemperatureMeasurement\`.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|temperature value|YES|Number| &nbsp;|
|2|time|NO|Date|Current server time|

**Example**

\`\`\`text
211,25,2016-06-22T17:03:14.000+02:00
\`\`\`

##### Create battery measurement (212) {#212}

Create a measurement of type \`c8y_Battery\`.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|battery value|YES|Number| &nbsp;|
|2|time|NO|Date|Current server time|

**Example**

\`\`\`text
212,95,2016-06-22T17:03:14.000+02:00
\`\`\`

#### Alarm templates (3xx) {#alarm-templates}

##### Create CRITICAL alarm (301) {#301}

Create a CRITICAL alarm.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|type|YES|String| &nbsp;|
|2|text|NO|String|Alarm of type **alarmType** raised|
|3|time|NO|Date|Current server time|

**Example**

\`\`\`text
301,c8y_TemperatureAlarm
\`\`\`

##### Create MAJOR alarm (302) {#302}

Create a MAJOR alarm.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|type|YES|String| &nbsp;|
|2|text|NO|String|Alarm of type **alarmType** raised|
|3|time|NO|Date|Current server time|

**Example**

\`\`\`text
302,c8y_TemperatureAlarm,"This is an alarm"
\`\`\`

##### Create MINOR alarm (303) {#303}

Create a MINOR alarm.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|type|YES|String| &nbsp;|
|2|text|NO|String|Alarm of type **alarmType** raised|
|3|time|NO|Date|Current server time|

**Example**

\`\`\`text
303,c8y_TemperatureAlarm
\`\`\`

##### Create WARNING alarm (304) {#304}

Create a WARNING alarm.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|type|YES|String| &nbsp;|
|2|text|NO|String|Alarm of type **alarmType** raised|
|3|time|NO|Date|Current server time|

**Example**

\`\`\`text
304,c8y_TemperatureAlarm,,2013-06-22T17:03:14.000+02:00
\`\`\`

##### Update severity of existing alarm (305) {#305}

Change the severity of an existing alarm.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|type|YES|String|
|2|severity|YES|String|

**Example**

\`\`\`text
305,c8y_TemperatureAlarm,CRITICAL
\`\`\`

##### Clear existing alarm (306) {#306}

Clear an existing alarm.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|type|YES|String|

**Example**

\`\`\`text
306,c8y_TemperatureAlarm
\`\`\`

##### Clear alarm's fragment (307) {#307}

Remove one or more fragments from an alarm of a specific type.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|alarmType|YES|String|
|2...|fragmentName|YES|String|

**Example**

\`\`\`text
307,c8y_TemperatureAlarm,c8y_Position,c8y_Configuration
\`\`\`

#### Event templates (4xx) {#event-templates}

##### Create basic event (400) {#400}

Create an event of given type and text.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|type|YES|String|&nbsp;|
|2|text|YES|String|&nbsp;|
|3|time|NO|Date|Current server time|

**Example**

\`\`\`text
400,c8y_MyEvent,"Something was triggered"
\`\`\`

##### Create location update event (401) {#401}

Create typical location update event containing \`c8y_Position\`.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|latitude|NO|Number|&nbsp;|
|2|longitude|NO|Number|&nbsp;|
|3|altitude|NO|Number|&nbsp;|
|4|accuracy|NO|Number|&nbsp;|
|5|time|NO|Date|Current server time|

**Example**

\`\`\`text
401,51.151977,6.95173,67
\`\`\`

##### Create location update event with device update (402) {#402}

Create typical location update event containing \`c8y_Position\`. Additionally the device will be updated with the same \`c8y_Position\` fragment.

|Position|Parameter|Mandatory|Type|Default value|
|:-------|:-------|:-------|:-------|:---|
|1|latitude|NO|Number|&nbsp;|
|2|longitude|NO|Number|&nbsp;|
|3|altitude|NO|Number|&nbsp;|
|4|accuracy|NO|Number|&nbsp;|
|5|time|NO|Date|Current server time|

**Example**

\`\`\`text
402,51.151977,6.95173,67
\`\`\`

##### Clear event's fragment (407) {#407}

Remove one or more fragments from an event of a specific type.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|eventType|YES|String|
|2...|fragmentName|NO|String|

**Example**

\`\`\`text
407,c8y_MyEvent,c8y_Position,c8y_Configuration
\`\`\`

#### Operation templates (5xx) {#operation-templates}

##### Get PENDING operations (500) {#500}

Trigger the sending of all PENDING operations for the agent.

**Example**

\`\`\`text
500
\`\`\`

##### Set operation to EXECUTING (501) {#501}

Set the oldest PENDING operation with given fragment to EXECUTING.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|fragment|YES|String|

**Example**

\`\`\`text
501,c8y_Restart
\`\`\`

##### Set operation to FAILED (502) {#502}

Set the oldest EXECUTING operation with given fragment to FAILED.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|fragment|YES|String|
|2|failureReason|NO|String|

**Example**

\`\`\`text
502,c8y_Restart,"Could not restart"
\`\`\`

##### Set operation to SUCCESSFUL (503) {#503}

Set the oldest EXECUTING operation with given fragment to SUCCESSFUL.

It enables the device to send additional parameters that trigger additional steps based on the type of operation sent as fragment (see Section [Updating operations](#updating-operations)).

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|fragment|YES|String|
|2...|parameters|NO|String|

**Example**

\`\`\`text
503,c8y_Restart
\`\`\`

##### Set operation to EXECUTING (504) {#504}

Set the operation with the given ID to EXECUTING. The operation must exist and must have the requesting device as the source.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|operationId|YES|String|

**Example**

\`\`\`text
504,123
\`\`\`

##### Set operation to FAILED (505) {#505}

Set the operation with the given ID to FAILED. The operation must exist and must have the requesting device as the source.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|operationId|YES|String|
|2|failureReason|NO|String|

**Example**

\`\`\`text
505,123,"Could not restart"
\`\`\`

##### Set operation to SUCCESSFUL (506) {#506}

Set the operation with given ID to SUCCESSFUL. The operation must exist and must have the requesting device as the source.

This may let the device send additional parameters that trigger further steps based on the type of the operation, also see [Updating operations](#updating-operations).

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|operationId|YES|String|
|2...|parameters|NO|String|

**Example**

\`\`\`text
506,c8y_Restart
\`\`\`

##### Set EXECUTING operations to FAILED (507) {#507}

Set EXECUTING operations with a given fragment to FAILED.
If the fragment parameter is empty, all EXECUTING operations are set to FAILED.

|Position|Parameter|Mandatory|Type|
|:-------|:-------|:-------|:---|
|1|fragment|NO|String|
|2|failureReason|NO|String|

**Example**

\`\`\`text
507,c8y_Restart,"Unexpected device restart"
\`\`\`
-- End info --


Use the message IDs described in the information between "-- Start Info --" and "-- End info --" provide above

Please include:

- A descriptive name for the simulator
- always include a meaningful custom operation in the supportedOperations array
- 30 to 50 relevant measurements or events for each simulator
- 5 to 10 appropriate alarms for each simulator
- Position updates if applicable to the use case
- Random sleep intervals between 5 and 60 seconds
- the commandQueue for each simulator must contain 50 items with the type \`sleep\`
- ensure that commandQueue items with the type \`sleep\` are not consecutive
- ensure that each measurement has multiple updates with realistic values and in sync with related measurements
- Note that the commands in the commandQueue are sent in a loop, so try to send values where the last measurement matches with the first one.
- Ensure temperature units are in 'C' (not 'ºC')
- For alarms, use an empty string as the last item in the values array

this is an example of the expected output

<expected_output>
[
  {
    "name": "Electric Car",
    "state": "RUNNING",
    "instances": 1,
    "supportedOperations": [
      "c8y_Restart",
      "c8y_Configuration",
      "c8y_SoftwareList",
      "c8y_Firmware"
    ],
    "commandQueue": [
      {
        "type": "builtin",
        "messageId": "200",
        "values": ["c8y_Speed", "speed", "80", "km/h"]
      },
      {
        "type": "builtin",
        "messageId": "402",
        "values": ["48.8566", "2.3522", "30", "6"]
      },
      {
        "type": "sleep",
        "seconds": 28
      },
      {
        "type": "builtin",
        "messageId": "200",
        "values": ["c8y_BatteryLevel", "battery", "15", "%"]
      },
      {
        "type": "builtin",
        "messageId": "301",
        "values": ["c8y_LowBatteryAlarm", "Low battery level!", ""]
      },
      {
        "type": "builtin",
        "messageId": "402",
        "values": ["48.8570", "2.3530", "32", "6"]
      },
      {
        "type": "sleep",
        "seconds": 39
      },
      {
        "type": "builtin",
        "messageId": "200",
        "values": ["c8y_TirePressure", "pressure", "28", "psi"]
      },
      {
        "type": "builtin",
        "messageId": "301",
        "values": [
          "c8y_LowTirePressureAlarm",
          "Low tire pressure detected!",
          ""
        ]
      },
      {
        "type": "sleep",
        "seconds": 47
      }
    ]
  },
  {
    "id": "582189204",
    "name": "Electric Car Charging Station",
    "state": "RUNNING",
    "instances": 1,
    "commandQueue": [
      {
        "type": "builtin",
        "messageId": "200",
        "values": ["c8y_ChargingPower", "power", "7.2", "kW"]
      },
      {
        "type": "builtin",
        "messageId": "200",
        "values": ["c8y_ChargingVoltage", "voltage", "230", "V"]
      },
      {
        "type": "builtin",
        "messageId": "200",
        "values": ["c8y_ChargingCurrent", "current", "31.3", "A"]
      },
      {
        "type": "sleep",
        "seconds": 12.0
      },
      {
        "type": "builtin",
        "messageId": "200",
        "values": ["c8y_EnergyConsumed", "energy", "45.6", "kWh"]
      },
      {
        "type": "builtin",
        "messageId": "200",
        "values": ["c8y_ConnectorTemperature", "temperature", "28.5", "C"]
      },
      {
        "type": "sleep",
        "seconds": 18.0
      },
      {
        "type": "builtin",
        "messageId": "200",
        "values": ["c8y_ChargingPower", "power", "7.3", "kW"]
      },
      {
        "type": "builtin",
        "messageId": "200",
        "values": ["c8y_ChargingCurrent", "current", "31.7", "A"]
      },
      {
        "type": "sleep",
        "seconds": 25.0
      }
    ]
  }
]
</expected_output>

All i need to provide you is the number of simulators and the specific use case, in return you should
provide me a single json file with an array of simulators, but only the plain JSON, nothing else

CRITICAL OUTPUT FORMAT REQUIREMENTS:
Your ENTIRE response must be ONLY the raw JSON array. No markdown, no code fences, no tags, no explanation.
- First character of your response: [
- Last character of your response: ]
- Do NOT use markdown code fences (\`\`\`json or \`\`\`)
- Do NOT use any XML/HTML tags (including <expected_output> from example above)
- Do NOT include any text before or after the JSON

INCORRECT RESPONSE (DO NOT DO THIS):
\`\`\`json
[{"name": "simulator"}]
\`\`\`

CORRECT RESPONSE (DO THIS):
[{"name": "simulator"}]
`;
