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
var import_updateDeviceDetails = require("./updateDeviceDetails");
var import_updateDeviceOnError = require("./updateDeviceOnError");
var import_logging = require("./logging");
var import_axios = require("./axios");
var import_axiosParameter = require("./axiosParameter");
async function updateDeviceStatus(store) {
  var _a, _b, _c, _d, _e, _f;
  const { adapter } = store;
  try {
    const { token, device: deviceCode, apiLevel } = store;
    if (!token || !deviceCode) {
      return;
    }
    const { sURL } = (0, import_endPoints.getUpdateDeviceStatusSUrl)(store);
    const payload = apiLevel < 3 ? { device_code: deviceCode } : { deviceCode };
    const { data, error } = await (0, import_axios.request)(adapter, sURL, payload, (0, import_axiosParameter.getHeaders)(token));
    if (!data || error) {
      await store.resetOnErrorHandler();
      return;
    }
    adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);
    const status = apiLevel < 3 ? (_a = data.object_result) == null ? void 0 : _a.status : (_b = data.objectResult) == null ? void 0 : _b.status;
    store.reachable = status === "ONLINE";
    await store.saveValue("info.connection", store.reachable);
    if (!store.reachable) {
      return;
    }
    const isFault = apiLevel < 3 ? (_c = data.object_result) == null ? void 0 : _c.is_fault : (_f = (_d = data.objectResult) == null ? void 0 : _d.is_fault) != null ? _f : (_e = data.objectResult) == null ? void 0 : _e.isFault;
    if (isFault === true) {
      await store.saveValue("error", true);
      await (0, import_updateDeviceDetails.updateDeviceDetails)(store);
      await (0, import_updateDeviceOnError.updateDeviceErrorMsg)(store);
      return;
    }
    await store.saveValue("error", false);
    await store.saveValue("errorMessage", "");
    await store.saveValue("errorCode", "");
    await store.saveValue("errorLevel", 0);
    await (0, import_updateDeviceDetails.updateDeviceDetails)(store);
  } catch (error) {
    await store.resetOnErrorHandler();
    (0, import_logging.errorLogger)("Error in updateDeviceStatus", error, adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceStatus
});
//# sourceMappingURL=updateDeviceStatus.js.map
