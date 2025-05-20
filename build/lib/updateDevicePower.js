"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var updateDevicePower_exports = {};
__export(updateDevicePower_exports, {
  updateDevicePower: () => updateDevicePower
});
module.exports = __toCommonJS(updateDevicePower_exports);
var import_getSettings = require("./getSettings");
var import_store = require("./store");
var import_endPoints = require("./endPoints");
var import_axiosParameter = require("./axiosParameter");
var import_saveValue = require("./saveValue");
var import_axios = __toESM(require("axios"));
var import_logging = require("./logging");
async function updateDevicePower(deviceCode, power) {
  const store = (0, import_store.initStore)();
  try {
    const token = store.token;
    const { powerMode, powerOpt } = (0, import_getSettings.getPowerMode)(power);
    if (powerOpt === null || powerMode === null) {
      return;
    }
    if (token && token != "") {
      const { sURL } = (0, import_endPoints.getSUrl)();
      const response = await import_axios.default.post(
        sURL,
        (0, import_axiosParameter.getAxiosUpdateDevicePowerParams)({ deviceCode, value: powerOpt, protocolCode: "Power" }),
        {
          headers: { "x-token": token }
        }
      );
      store._this.log.debug(`DeviceStatus: ${JSON.stringify(response.data)}`);
      if (parseInt(response.data.error_code) == 0) {
        await (0, import_saveValue.saveValue)("mode", power.toString(), "string");
        if (power >= 0) {
          await updateDeviceMode(store.device, power);
        }
        return;
      }
      store._this.log.error(`Error: ${JSON.stringify(response.data)}`);
      store.resetOnErrorHandler();
    }
  } catch (error) {
    store._this.log.error(JSON.stringify(error));
    store._this.log.error(JSON.stringify(error.stack));
  }
}
async function updateDeviceMode(deviceCode, mode) {
  const store = (0, import_store.initStore)();
  const token = store.token;
  try {
    if (token && token != "") {
      const { sURL } = (0, import_endPoints.getSUrl)();
      const response = await import_axios.default.post(
        sURL,
        (0, import_axiosParameter.getAxiosUpdateDevicePowerParams)({ deviceCode, value: mode, protocolCode: "mode" }),
        {
          headers: { "x-token": token }
        }
      );
      store._this.log.debug(`DeviceStatus: ${JSON.stringify(response.data)}`);
      if (parseInt(response.data.error_code) == 0) {
        await (0, import_saveValue.saveValue)("mode", mode, "string");
        return;
      }
      store._this.log.error(`Error: ${JSON.stringify(response.data)}`);
      store.resetOnErrorHandler();
    }
  } catch (error) {
    (0, import_logging.errorLogger)("Error in updateDeviceMode", error, store._this);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDevicePower
});
//# sourceMappingURL=updateDevicePower.js.map
