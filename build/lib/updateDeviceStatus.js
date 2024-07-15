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
var import_endPoints = require("./endPoints");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
var import_updateDeviceDetails = require("./updateDeviceDetails");
var import_updateDeviceOnError = require("./updateDeviceOnError");
async function updateDeviceStatus() {
  var _a, _b, _c, _d;
  const store = (0, import_store.initStore)();
  try {
    const { token, device: deviceCode } = store;
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
      if (parseInt(response.data.error_code) == 0) {
        if (((_b = (_a = response.data) == null ? void 0 : _a.object_result) == null ? void 0 : _b["is_fault"]) || ((_d = (_c = response.data) == null ? void 0 : _c.objectResult) == null ? void 0 : _d["isFault"])) {
          (0, import_saveValue.saveValue)("error", true, "boolean");
          (0, import_updateDeviceDetails.updateDeviceDetails)();
          (0, import_updateDeviceOnError.updateDeviceErrorMsg)();
          return;
        }
        (0, import_saveValue.saveValue)("error", false, "boolean");
        (0, import_saveValue.saveValue)("errorMessage", "", "string");
        (0, import_saveValue.saveValue)("errorCode", "", "string");
        (0, import_saveValue.saveValue)("errorLevel", 0, "number");
        (0, import_updateDeviceDetails.updateDeviceDetails)();
        return;
      }
      (0, import_saveValue.saveValue)("info.connection", false, "boolean");
      return;
    }
    store.token = "", store.device = "", store.reachable = false;
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
