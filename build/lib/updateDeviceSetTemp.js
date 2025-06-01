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
var import_saveValue = require("./saveValue");
var import_store = require("./store");
var import_logging = require("./logging");
var import_axios = require("./axios");
var import_utils = require("./utils");
const updateDeviceSetTemp = async (adapter, deviceCode, temperature) => {
  const store = (0, import_store.initStore)();
  const dpRoot = store.getDpRoot();
  try {
    const token = store.token;
    const sTemperature = temperature.toString().replace(",", ".");
    const result = await adapter.getStateAsync(`${dpRoot}.mode`);
    if (!((result == null ? void 0 : result.val) || (result == null ? void 0 : result.val) === 0)) {
      return;
    }
    if ((0, import_utils.isToken)(token)) {
      const { sURL } = (0, import_endPoints.getSUrl)();
      const { data, error } = await (0, import_axios.request)(
        adapter,
        sURL,
        (0, import_axiosParameter.getAxiosUpdateDeviceSetTempParams)({ deviceCode, sTemperature }),
        (0, import_axiosParameter.getHeaders)(token)
      );
      adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);
      if (error) {
        store.resetOnErrorHandler();
        return;
      }
      await (0, import_saveValue.saveValue)({ key: "tempSet", value: temperature, stateType: "number", adapter });
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
