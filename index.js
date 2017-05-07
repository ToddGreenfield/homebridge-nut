'use strict';

// Nut (Network UPS Tool) Platform for HomeBridge
//
// Remember to add platform to config.json. Example:
// "platforms": [
//     {
//         "platform": "Nut",					// required
//         "name": "Nut",						// Optional - defaults to Nut - Only used for platform logging tags.
//         "host": "localhost",					// Optional - defaults to localhost
//         "port": "3493",						// Optional - defaults to 3493
//         "search_time_delay": "1",			// Optional - defaults to 1 second. Initial search time delay in seconds.
//         "low_batt_threshold": "40",			// Optional - defaults to 40%. Low Battery Threshold.
//         "polling": "120"						// Optional - defaults to OFF or 0. Time in seconds.
//     }
// ], 
//
//

var Nut = require("node-nut");
var _ = require("underscore");
var pNut, connected;

function NutPlatform(log, config){
	this.config = config;
	this.host = config["host"] || 'localhost';
	this.port = config["port"] || '3493';
	this.name = config["name"] || 'Nut';
	this.nutListTimeout = config["search_time_delay"] || '1';
	this.nutListTimeout *= 1000;
	this.nutPolling = config["polling"] || '0';
	this.lowBattThreshold = config["low_batt_threshold"] || '40';
	this.log = log;
	this.log("Starting Nut Platform on %s:%s. Polling (seconds): %s", this.host, this.port, (this.nutPolling == '0') ? 'OFF' : this.nutPolling);
	this.initialized = false;
	var nutAccessories, upsInfo;
	connected = false;

	pNut = new Nut(this.port, this.host); 
		
	pNut.on('ready', this.eventReady.bind(this));
	pNut.on('close', this.eventClose.bind(this));
	pNut.on('error', this.eventError.bind(this));	
	
	pNut.start();
}

NutPlatform.prototype = {
    accessories: function(callback) {
        var that = this;
        var foundAccessories = [];
		var acc, accName, accFriendlyName;
		setTimeout(function() {
			accName = _.keys(that.nutAccessories);
			accFriendlyName = _.values(that.nutAccessories);
			for (acc in accName) {
				that.log("Received Nut accessory %s (%s) from the %s platform.", accName[acc], accFriendlyName[acc], that.name);
				that.getInfo(accName[acc], function(err, upsInfo) {
					if (!err) {
						var accessory = new NutAccessory(that, accName[acc], accFriendlyName[acc], upsInfo);
						that.initialized = true;
						foundAccessories.push(accessory);
						callback(foundAccessories);
					} else {
						that.log("Nut Error: %s", err);
					}
				});
			}
		}, this.nutListTimeout);
	},

	eventReady: function() {
		var that = this;
		if (!that.initialized) {
			connected = true;
			this.log("Nut eventReady received. Initializing and getting list of Nut accessories.");
			pNut.GetUPSList(function(upslist) {
				that.nutAccessories = upslist;
			});
		} else {
			connected = true;
			this.log("Nut eventReady received. Successful reconnect after disconnection.");
		}
	},

	eventClose: function() {
		var that = this;
		connected = false;
		this.log("Nut eventDisconnect occured.");
	},

	eventError: function(error) {
		this.log("Nut eventError received - %s.", error);
	},
	
	getInfo: function(upsName, callback) {
		var that = this;
		if (connected) {
			pNut.GetUPSVars(upsName, function(upsvars) {
				callback(null, upsvars);
			});
		} else {
			callback("Nut Error: not connected to Nut", null);
		}
	}
}

function NutAccessory(platform, accessory, accessoryFriendly, accessoryVars) {
	this.nutName = accessory; 
	this.name = accessoryFriendly;
	this.accVars = accessoryVars; 
	this.platform = platform;
    this.log = this.platform.log;
	this.nutPolling = this.platform.nutPolling;
	this.nutPolling *= 1000;
	this.lowBattThreshold = this.platform.lowBattThreshold;	
	if (this.nutPolling > 0) {
		var that = this;
		setTimeout(function() {
			that.log('Nut Service Polling begin for %s...', that.name);
			that.servicePolling();
		}, this.nutPolling);
	};
}

NutAccessory.prototype = {

	identify: function(callback){
		this.log("Nut Identify requested for %s!", this.name);
		callback();
	},
	
	getCheck: function(callback){
        var that = this;
		this.log('Nut checking connection to Nut Server for %s.', this.name);
		if (connected) {
			this.log('Nut connection to Nut Server Successful.');
			that.getVars(function(callback) {
			}.bind(this));
		} else {
			this.log('Nut NOT connected, attempting 1st reconnection attempt...');
			pNut.start();
			setTimeout(function() {
				if (connected) {
					that.getVars(function (callback) {
					}.bind(this));
				} else {
					that.log('Nut unable to reconnect!');
					that.service.setCharacteristic(Characteristic.StatusFault,1);
				}
			}, this.platform.nutListTimeout+1000); //  <<<--- May need to be adjusted- Timing issue for some? 
		}
	callback();
	},
	
    getVars: function(callback){
        var that = this;
		this.log('Nut request to get vars for %s.', this.name);
		if (connected) {
			this.platform.getInfo(this.nutName, function(err, upsInfo) {
				if (!err) {
					that.service.setCharacteristic(Characteristic.StatusFault,0);
					that.serviceBatt.setCharacteristic(Characteristic.BatteryLevel,parseFloat(upsInfo["battery.charge"]));
					if (parseInt(upsInfo["battery.charge"]) < parseInt(that.lowBattThreshold)) {
						that.serviceBatt.setCharacteristic(Characteristic.StatusLowBattery,true);
					} else {
						that.serviceBatt.setCharacteristic(Characteristic.StatusLowBattery,false);
					}
					if (upsInfo["ups.status"] == "OL CHRG") { 
						that.serviceBatt.setCharacteristic(Characteristic.ChargingState,1);
					} else if (upsInfo["ups.status"] == "OB DISCHRG") {
						that.serviceBatt.setCharacteristic(Characteristic.ChargingState,2);
					} else {
						that.serviceBatt.setCharacteristic(Characteristic.ChargingState,0);
					}
					if (parseInt(upsInfo["ups.load"]) > 0) {
						that.service.setCharacteristic(Characteristic.StatusActive,true);
					} else {
						that.service.setCharacteristic(Characteristic.StatusActive,false);
					}
					if (upsInfo["input.voltage"] == "0.0") {
						that.service.setCharacteristic(Characteristic.ContactSensorState,true);
					} else {
						that.service.setCharacteristic(Characteristic.ContactSensorState,false);
					}
				} else {
					that.log("Nut Error: %s", err);
				}
			}.bind(this));
		} else {
			this.log('Nut request failed. Not connected.');
			that.service.setCharacteristic(Characteristic.StatusFault,1);
		}
		callback();	
	},

	servicePolling: function(){
		var that = this;
		this.log('Nut is Polling for %s...', this.name);
		this.getCheck(function (callback) {
			setTimeout(function() { 
				that.servicePolling();
			}, that.nutPolling);
		});
	},
	
    getServices: function() {
        var that = this;
        var services = []

        this.service = new Service.ContactSensor(this.name);
		this.service.getCharacteristic(Characteristic.ContactSensorState) // Has input voltage (power)
			.on('get', this.getCheck.bind(this));;
		this.service.addCharacteristic(Characteristic.StatusActive); // Has load (being used)
		this.service.addCharacteristic(Characteristic.StatusFault); // Used if unable to connect to Nut Server
		services.push(this.service);

		var serviceInfo = new Service.AccessoryInformation();

  		serviceInfo.setCharacteristic(Characteristic.Manufacturer, this.accVars["device.mfr"])
            .setCharacteristic(Characteristic.Name, this.name)
			.setCharacteristic(Characteristic.SerialNumber, this.accVars["ups.productid"])
			.setCharacteristic(Characteristic.Model, this.accVars["device.model"]);
        services.push(serviceInfo);

		this.serviceBatt = new Service.BatteryService();
		this.serviceBatt.setCharacteristic(Characteristic.BatteryLevel, this.accVars["battery.charge"])
			.setCharacteristic(Characteristic.Name, this.name)
			.setCharacteristic(Characteristic.ChargingState, 0)
			.setCharacteristic(Characteristic.StatusLowBattery, false);
		services.push(this.serviceBatt);
        
		return services;
    }
}

module.exports.accessory = NutAccessory;
module.exports.platform = NutPlatform;

var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-nut-accessory", "NutAccessory", NutAccessory);
  homebridge.registerPlatform("homebridge-nut", "Nut", NutPlatform);
};