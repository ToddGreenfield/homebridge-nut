var inherits = require('util').inherits;
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  UUID = homebridge.hap.uuid;

  var EnterpriseTypes = {};


  // Characteristics

EnterpriseTypes.InputVoltageAC = function() {
    var serviceUUID = UUID.generate('EnterpriseTypes:usagedevice:InputVoltageAC');
    Characteristic.call(this, 'Input Voltage AC', serviceUUID);
    this.setProps({
      format:   Characteristic.Formats.Float,
      unit:     "V",
      minValue: 0,
      maxValue: 65535,
      minStep:  .01,
      perms:    [ Characteristic.Perms.READ, Characteristic.Perms.NOTIFY ]
    });
    this.value = this.getDefaultValue();
  };
  inherits(EnterpriseTypes.InputVoltageAC, Characteristic);
  
EnterpriseTypes.OutputVoltageAC = function() {
    var serviceUUID = UUID.generate('EnterpriseTypes:usagedevice:OutputVoltageAC');
    Characteristic.call(this, 'Output Voltage AC', serviceUUID);
    this.setProps({
      format:   Characteristic.Formats.Float,
      unit:     "V",
      minValue: 0,
      maxValue: 65535,
      minStep:  .01,
      perms:    [ Characteristic.Perms.READ, Characteristic.Perms.NOTIFY ]
    });
    this.value = this.getDefaultValue();
  };
  inherits(EnterpriseTypes.OutputVoltageAC, Characteristic);
  
EnterpriseTypes.BatteryVoltageDC = function() {
    var serviceUUID = UUID.generate('EnterpriseTypes:usagedevice:BatteryVoltageDC');
    Characteristic.call(this, 'Battery Voltage DC', serviceUUID);
    this.setProps({
      format:   Characteristic.Formats.Float,
      unit:     "V",
      minValue: 0,
      maxValue: 65535,
      minStep:  .01,
      perms:    [ Characteristic.Perms.READ, Characteristic.Perms.NOTIFY ]
    });
    this.value = this.getDefaultValue();
  };
  inherits(EnterpriseTypes.BatteryVoltageDC, Characteristic);
  
EnterpriseTypes.UPSLoadPercent = function() {
    var serviceUUID = UUID.generate('EnterpriseTypes:usagedevice:UPSLoadPercent');
    Characteristic.call(this, 'UPS Load', serviceUUID);
    this.setProps({
      format:   Characteristic.Formats.UINT8,
      unit: Characteristic.Units.PERCENTAGE,
      minValue: 0,
      maxValue: 100,
      minStep:  1,
      perms:    [ Characteristic.Perms.READ, Characteristic.Perms.NOTIFY ]
    });
    this.value = this.getDefaultValue();
  };
  inherits(EnterpriseTypes.UPSLoadPercent, Characteristic);
  
  return EnterpriseTypes;
};