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
var updateDeviceSetTemp_exports = {};
__export(updateDeviceSetTemp_exports, {
  updateDeviceSetTemp: () => updateDeviceSetTemp
});
module.exports = __toCommonJS(updateDeviceSetTemp_exports);
var import_axios = __toESM(require("axios"));
var import_axiosParameter = require("./axiosParameter");
var import_endPoints = require("./endPoints");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
const updateDeviceSetTemp = async (deviceCode, temperature) => {
  const store = (0, import_store.initStore)();
  const dpRoot = store.getDpRoot();
  try {
    const token = store.token;
    const sTemperature = temperature.toString().replace(",", ".");
    const result = await store._this.getStateAsync(dpRoot + ".mode");
    if (!result || !result.val) {
      return;
    }
    let sMode = result.val;
    if (sMode == "-1") {
      return;
    } else if (sMode == "0") {
      sMode = "R01";
    } else if (sMode == "1") {
      sMode = "R02";
    } else if (sMode == "2") {
      sMode = "R03";
    }
    if (token && token != "") {
      const { sURL } = (0, import_endPoints.getSUrl)();
      const response = await import_axios.default.post(sURL, (0, import_axiosParameter.getAxiosUpdateDeviceSetTempParams)({ deviceCode, sTemperature }), {
        headers: { "x-token": token }
      });
      store._this.log.info("DeviceStatus: " + JSON.stringify(response.data));
      if (parseInt(response.data.error_code) == 0) {
        (0, import_saveValue.saveValue)("tempSet", temperature, "number");
        return;
      }
      store._this.log.error("Error: " + JSON.stringify(response.data));
      store.resetOnErrorHandler();
      (0, import_saveValue.saveValue)("info.connection", false, "boolean");
    }
  } catch (error) {
    store._this.log.error(JSON.stringify(error));
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceSetTemp
});
//# sourceMappingURL=updateDeviceSetTemp.js.map
