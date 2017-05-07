# Homebridge-nut

NUT (Network UPS Tools) Plugin for [Homebridge] (https://github.com/nfarina/homebridge)
Leverages [node-nut](https://github.com/skarcha/node-nut)

This plugin allows you to monitor your UPS's with HomeKit and Siri via a NUT Client.

## Installation
1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-nut`
3. Update your configuration file like the example below.
4. Ensure you have a NUT client/server running somewhere. For assistance - http://wynandbooysen.com/raspberry-pi-ups-server-using-nut.html.

This plugin is a Platform and will create a ContactSensor element along with a BatteryService for each USB returned from your NUT Client.
* ContactSensorState will show CLOSED for Voltage > 0.0.
* StatusActive will be true if UPS Load is > 0.
* StatusFault will be true is NUT is not reachable.
* BatteryLevel will show the BatteryCharge percent.
* ChargingState will show Charging, Not Charging (Online and 100%), or Not Chargable (On Battery).
* StatusLowBattery will be true if low_batt_threshold is breached. This can potentially notify you prior to your Nut shutting down its server(s).
	
## Configuration
Example config.json:

```js
"platforms": [
     {
         "platform": "Nut",				// required
         "name": "Nut",					// Optional - defaults to Nut - Only used for platform logging tags.
         "host": "localhost",			// Optional - defaults to localhost
         "port": "3493",				// Optional - defaults to 3493
         "search_time_delay": "1",		// Optional - defaults to 1 second. Initial search time delay in seconds.
         "low_batt_threshold": "40",	// Optional - defaults to 40%. Low Battery Threshold.
         "polling": "120"				// Optional - defaults to OFF or 0. Time in seconds.
     }
]
```

## Explanation:

Field           		| Description
------------------------|------------
**platform**   			| Must always be "Nut". (required)
**name**        		| Name override for the platform log. (Optional) Defaults to Nut. 
**host** 			 	| The internal ip address or hostname of your Nut Client/Server.(Optional) Defaults to localhost.
**port**				| Port on which Nut Client is listening. (Optional) Defaults to 3493.
**search_time_delay**	| Short delay on startup to list out Nut devices. (Optional) Defaults to 1 second.
**low_batt_warning**	| Percent at which UPS will raise low battery. (Optional) Defaults to 40%.
**polling**				| Polling interval. (Optional) Defaults to 0 seconds, which is OFF or no polling.
