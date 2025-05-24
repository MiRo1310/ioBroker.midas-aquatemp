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
var updateDeviceStatus_exports = {};
__export(updateDeviceStatus_exports, {
  updateDeviceStatus: () => updateDeviceStatus
});
module.exports = __toCommonJS(updateDeviceStatus_exports);
var import_axios = __toESM(require("axios"));
var import_main = require("../main");
var import_endPoints = require("./endPoints");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
var import_updateDeviceDetails = require("./updateDeviceDetails");
var import_updateDeviceOnError = require("./updateDeviceOnError");
var import_logging = require("./logging");
let _this;
async function updateDeviceStatus(adapter) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const store = (0, import_store.initStore)();
  try {
    if (!_this) {
      _this = import_main.MidasAquatemp.getInstance();
    }
    const { token, device: deviceCode, apiLevel } = store;
    if (token) {
      const { sURL } = (0, import_endPoints.getUpdateDeviceStatusSUrl)();
      const response = await import_axios.default.post(
        sURL,
        {
          device_code: deviceCode,
          deviceCode
        },
        {
          headers: { "x-token": token }
        }
      );
      store.reachable = apiLevel < 3 ? ((_b = (_a = response.data.object_result) == null ? void 0 : _a[0]) == null ? void 0 : _b.device_status) == "ONLINE" : ((_d = (_c = response.data.objectResult) == null ? void 0 : _c[0]) == null ? void 0 : _d.deviceStatus) == "ONLINE";
      adapter.log.debug(`DeviceStatus: ${JSON.stringify(response.data)}`);
      if (parseInt(response.data.error_code) == 0) {
        if (((_f = (_e = response.data) == null ? void 0 : _e.object_result) == null ? void 0 : _f.is_fault) || ((_h = (_g = response.data) == null ? void 0 : _g.objectResult) == null ? void 0 : _h.isFault)) {
          store._this.log.error(`Error in updateDeviceStatus(): ${JSON.stringify(response.data)}`);
          await (0, import_saveValue.saveValue)("error", true, "boolean", adapter);
          await (0, import_updateDeviceDetails.updateDeviceDetails)(adapter);
          await (0, import_updateDeviceOnError.updateDeviceErrorMsg)(adapter);
          return;
        }
        await (0, import_saveValue.saveValue)("error", false, "boolean", adapter);
        await (0, import_saveValue.saveValue)("errorMessage", "", "string", adapter);
        await (0, import_saveValue.saveValue)("errorCode", "", "string", adapter);
        await (0, import_saveValue.saveValue)("errorLevel", 0, "number", adapter);
        await (0, import_updateDeviceDetails.updateDeviceDetails)(adapter);
        return;
      }
      store.resetOnErrorHandler();
      return;
    }
    store.resetOnErrorHandler();
  } catch (error) {
    (0, import_logging.errorLogger)("Error in updateDeviceStatus", error, store._this);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceStatus
});
//# sourceMappingURL=updateDeviceStatus.js.map
