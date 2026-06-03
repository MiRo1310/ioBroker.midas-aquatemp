"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var updateDeviceSetTemp_exports = {};
__export(updateDeviceSetTemp_exports, {
  updateDeviceSetTemp: () => updateDeviceSetTemp
});
module.exports = __toCommonJS(updateDeviceSetTemp_exports);
var import_axiosParameter = require("./axiosParameter");
var import_endPoints = require("./endPoints");
var import_logging = require("./logging");
var import_axios = require("./axios");
var import_utils = require("./utils");
const updateDeviceSetTemp = async (store, temperature) => {
  const { adapter, device } = store;
  const dpRoot = store.getDpRoot();
  try {
    const token = store.token;
    const numericTemperature = typeof temperature === "number" ? temperature : parseFloat(String(temperature).replace(",", "."));
    if (!Number.isFinite(numericTemperature)) {
      adapter.log.warn(`Invalid set temperature: ${temperature}`);
      return;
    }
    const sTemperature = numericTemperature.toString().replace(",", ".");
    const result = await adapter.getStateAsync(`${dpRoot}.mode`);
    if (!(result == null ? void 0 : result.val)) {
      adapter.log.warn(`Invalid mode: ${result == null ? void 0 : result.val}`);
      return;
    }
    if (String(result == null ? void 0 : result.val) === "-1") {
      adapter.log.debug(`Mode set to: ${result == null ? void 0 : result.val}`);
      return;
    }
    if ((0, import_utils.isToken)(token) && device) {
      const { sURL } = (0, import_endPoints.getSUrl)(store);
      const { data, error } = await (0, import_axios.request)(
        adapter,
        sURL,
        (0, import_axiosParameter.getAxiosUpdateDeviceSetTempParams)(device, sTemperature, store),
        (0, import_axiosParameter.getHeaders)(token)
      );
      adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);
      if (error) {
        await store.resetOnErrorHandler();
        return;
      }
      await store.saveValue("tempSet", numericTemperature);
    }
  } catch (error) {
    (0, import_logging.errorLogger)("Error in updateDeviceSetTemp", error, adapter);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceSetTemp
});
//# sourceMappingURL=updateDeviceSetTemp.js.map
