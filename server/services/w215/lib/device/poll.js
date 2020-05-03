const Promise = require('bluebird');
const requireUncached = require('require-uncached');

const dsp = requireUncached('hnap/js/soapclient');
const { EVENTS, DEVICE_FEATURE_CATEGORIES, DEVICE_FEATURE_TYPES, STATE } = require('../../../../utils/constants');
const { getDeviceFeature, getDeviceParam } = require('../../../../utils/device');
const logger = require('../../../../utils/logger');
const { W215_PIN_CODE } = require('../utils/constants');
const { parseExternalId } = require('../utils/parseExternalId');

/**
 * @description Poll values of an DSP-W215 device.
 * @param {Object} device - The device to poll.
 * @example
 * poll(device);
 */
async function poll(device) {
  // Galdys declaration for intricated code below
  const { gladys: gladysInstance } = this; // const gladys = this.gladys;

  // deviceId is the outlet's IP adress
  const { outletIpAdress } = parseExternalId(device.external_id);
  this.ip_adress = `http://${outletIpAdress}/HNAP1`;

  // To limit errors, we will determine if the device is OK with 4 features expected
  // + Outlet's PIN CODE
  const [binaryFeature, powFeature, tempFeature, energyFeature, pin] = await Promise.all([
    getDeviceFeature(device, DEVICE_FEATURE_CATEGORIES.SWITCH, DEVICE_FEATURE_TYPES.SWITCH.BINARY),
    getDeviceFeature(device, DEVICE_FEATURE_CATEGORIES.SWITCH, DEVICE_FEATURE_TYPES.SWITCH.POWER),
    getDeviceFeature(device, DEVICE_FEATURE_CATEGORIES.SWITCH, DEVICE_FEATURE_TYPES.SWITCH.TEMPERATURE),
    getDeviceFeature(device, DEVICE_FEATURE_CATEGORIES.SWITCH, DEVICE_FEATURE_TYPES.SWITCH.ENERGY),
    getDeviceParam(device, W215_PIN_CODE),
  ]);

  // Variable for debug login issue
  const user = this.username;
  this.pin_code = pin;

  dsp.login(this.username, parseInt(this.pin_code, 10), this.ip_adress).done(function(loginStatus) {
    if (loginStatus === 'failed' || loginStatus === 'undefined') {
      logger.debug(`Polling w215 ${user} / ${outletIpAdress} / ${pin} , connection status = ${loginStatus}`);
    } else {
      // success

      logger.debug(`w215 connection status : ${loginStatus} (IP Adress : ${outletIpAdress})`);
      // Outlet ON / OFF ?
      if (binaryFeature) {
        dsp.state().done(function(state) {
          const currentBinaryState = state === 'true' ? STATE.ON : STATE.OFF;
          // if the value is different from the value we have, save new state
          if (binaryFeature.last_value !== currentBinaryState && state !== 'undefined' && state !== 'ERROR') {
            logger.debug(`w215 new state = ${currentBinaryState}`);
            gladysInstance.event.emit(EVENTS.DEVICE.NEW_STATE, {
              device_feature_external_id: `${binaryFeature.external_id}`,
              state: currentBinaryState,
            });
          } else {
            logger.debug(`w215 state no DB update = ${currentBinaryState}`);
          }
        });
      }

      // Outlet temperature
      if (tempFeature) {
        dsp.temperature().done(function(temperature) {
          if (
            parseInt(tempFeature.last_value, 10) !== parseInt(temperature, 10) &&
            temperature !== 'undefined' &&
            temperature !== 'ERROR'
          ) {
            logger.debug(`w215 temperature : ${parseInt(temperature, 10)}°`);
            gladysInstance.event.emit(EVENTS.DEVICE.NEW_STATE, {
              device_feature_external_id: `${tempFeature.external_id}`,
              state: temperature,
            });
          } else {
            logger.debug(`w215 temperature no DB update = ${temperature}°`);
          }
        });
      }

      // Outlet consumption (W)
      if (powFeature) {
        dsp.consumption().done(function(consumption) {
          const powerRounded = Math.round(consumption);
          if (
            parseFloat(powFeature.last_value) !== powerRounded &&
            consumption !== 'undefined' &&
            consumption !== 'ERROR'
          ) {
            logger.debug(`w215 consumption : ${parseFloat(consumption)} Watt`);
            // Data rounded at closer integer
            gladysInstance.event.emit(EVENTS.DEVICE.NEW_STATE, {
              device_feature_external_id: `${powFeature.external_id}`,
              state: powerRounded,
            });
          } else {
            logger.debug(`w215 power no DB update = ${powerRounded} Watt`);
          }
        });
      }

      // Outlet total consumption (KWH)
      if (energyFeature) {
        dsp.totalConsumption().done(function(totalConsumption) {
          const energyRounded = Math.round(parseFloat(totalConsumption) * 1000) / 1000;
          if (
            parseFloat(energyFeature.last_value) !== energyRounded &&
            totalConsumption !== 'undefined' &&
            totalConsumption !== 'ERROR'
          ) {
            logger.debug(`w215 total consumption : ${parseFloat(totalConsumption)} kWh`);
            // Data rounded
            gladysInstance.event.emit(EVENTS.DEVICE.NEW_STATE, {
              device_feature_external_id: `${energyFeature.external_id}`,
              state: energyRounded,
            });
          } else {
            logger.debug(`w215 total consumption no DB update = ${energyRounded} kWh`);
          }
        });
      }
    }
  });
}

module.exports = {
  poll,
};