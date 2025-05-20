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
let _this;
async function updateDeviceStatus() {
  var _a, _b, _c, _d, _e, _f;
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
      store.reachable = apiLevel < 3 ? ((_a = response.data.object_result[0]) == null ? void 0 : _a.device_status) == "ONLINE" : ((_b = response.data.objectResult[0]) == null ? void 0 : _b.deviceStatus) == "ONLINE";
      if (parseInt(response.data.error_code) == 0) {
        if (((_d = (_c = response.data) == null ? void 0 : _c.object_result) == null ? void 0 : _d["is_fault"]) || ((_f = (_e = response.data) == null ? void 0 : _e.objectResult) == null ? void 0 : _f["isFault"])) {
          store._this.log.error("Error in updateDeviceStatus(): " + JSON.stringify(response.data));
          await (0, import_saveValue.saveValue)("error", true, "boolean");
          await (0, import_updateDeviceDetails.updateDeviceDetails)();
          await (0, import_updateDeviceOnError.updateDeviceErrorMsg)();
          return;
        }
        await (0, import_saveValue.saveValue)("error", false, "boolean");
        await (0, import_saveValue.saveValue)("errorMessage", "", "string");
        await (0, import_saveValue.saveValue)("errorCode", "", "string");
        await (0, import_saveValue.saveValue)("errorLevel", 0, "number");
        await (0, import_updateDeviceDetails.updateDeviceDetails)();
        return;
      }
      store.resetOnErrorHandler();
      return;
    }
    store.resetOnErrorHandler();
  } catch (error) {
    store._this.log.error(JSON.stringify(error));
    store._this.log.error(JSON.stringify(error.stack));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceStatus
});
//# sourceMappingURL=updateDeviceStatus.js.map
