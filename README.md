# Homebridge-nut
[![NPM Version](https://img.shields.io/npm/v/homebridge-nut.svg)](https://www.npmjs.com/package/homebridge-nut)

NUT (Network UPS Tools) Plugin for [Homebridge](https://github.com/nfarina/homebridge) leveraging [node-nut](https://github.com/skarcha/node-nut).

This plugin allows you to monitor your UPS's with HomeKit and Siri via a NUT Client.

## Installation
1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-nut`
3. Update your configuration file like the example below.
4. Ensure you have a NUT Client running somewhere. For assistance - http://wynandbooysen.com/raspberry-pi-ups-server-using-nut.html.

This plugin will create a ContactSensor element with BatteryService for each USB returned from your NUT Client.
* ContactSensorState will show OPEN if UPS Status starts with OB (On Battery).
* StatusActive will be true if UPS Load is > 0.
* StatusFault will be true is NUT is not reachable.
* BatteryLevel will show the BatteryCharge percent.
* ChargingState will show Charging, Not Charging (Online and 100%), or Not Chargable (On Battery).
* StatusLowBattery will be true if low_batt_threshold is breached. This can potentially notify you prior to your Nut shutting down its server(s).
* Input/Output/Battery Voltage will be shown if available, otherwise will show 0 or default values.

## Configuration
Example config.json:

```js
"platforms": [
     {
         "platform": "Nut",
         "name": "Nut",
         "host": "localhost",
         "port": "3493",
         "search_time_delay": "1",
         "low_batt_threshold": "40",
         "polling": "120"
     }
]
```

## Explanation:

Field           		| Description
------------------------|------------
**platform**   			| Required - Must always be "Nut".
**name**        		| Required - Name for platform logging. 
**host** 			 	| Optional - Internal ip or hostname of Nut Client. Default is localhost.
**port**				| Optional - Port which Nut Client is listening. Default is 3493.
**search_time_delay**	| Optional - Delay on startup to list Nut devices. Defaults to 1 second.
**low_batt_warning**	| Optional - Percent at which UPS will raise low battery. Default is 40.
**polling**				| Optional - Poll interval. Default is 0 sec, which is OFF or no polling.