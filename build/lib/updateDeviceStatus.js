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
var updateDeviceStatus_exports = {};
__export(updateDeviceStatus_exports, {
  updateDeviceStatus: () => updateDeviceStatus
});
module.exports = __toCommonJS(updateDeviceStatus_exports);
var import_endPoints = require("./endPoints");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
var import_updateDeviceDetails = require("./updateDeviceDetails");
var import_updateDeviceOnError = require("./updateDeviceOnError");
var import_logging = require("./logging");
var import_axios = require("./axios");
var import_axiosParameter = require("./axiosParameter");
async function updateDeviceStatus(adapter) {
  var _a, _b, _c, _d;
  const store = (0, import_store.initStore)();
  try {
    const { token, device: deviceCode, apiLevel } = store;
    if (!token || !deviceCode) {
      return;
    }
    const { sURL } = (0, import_endPoints.getUpdateDeviceStatusSUrl)();
    const payload = apiLevel < 3 ? { device_code: deviceCode } : { deviceCode };
    const { data, error } = await (0, import_axios.request)(adapter, sURL, payload, (0, import_axiosParameter.getHeaders)(token));
    if (!data || error) {
      store.resetOnErrorHandler();
      return;
    }
    adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);
    const isFault = apiLevel < 3 ? (_a = data.object_result) == null ? void 0 : _a.is_fault : (_d = (_b = data.objectResult) == null ? void 0 : _b.is_fault) != null ? _d : (_c = data.objectResult) == null ? void 0 : _c.isFault;
    if (isFault === true) {
      await (0, import_saveValue.saveValue)({ key: "error", value: true, stateType: "boolean", adapter });
      await (0, import_updateDeviceDetails.updateDeviceDetails)(adapter);
      await (0, import_updateDeviceOnError.updateDeviceErrorMsg)(adapter);
      return;
    }
    await (0, import_saveValue.saveValue)({ key: "error", value: false, stateType: "boolean", adapter });
    await (0, import_saveValue.saveValue)({ key: "errorMessage", value: "", stateType: "string", adapter });
    await (0, import_saveValue.saveValue)({ key: "errorCode", value: "", stateType: "string", adapter });
    await (0, import_saveValue.saveValue)({ key: "errorLevel", value: 0, stateType: "number", adapter });
    await (0, import_updateDeviceDetails.updateDeviceDetails)(adapter);
  } catch (error) {
    store.resetOnErrorHandler();
    (0, import_logging.errorLogger)("Error in updateDeviceStatus", error, adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceStatus
});
//# sourceMappingURL=updateDeviceStatus.js.map
