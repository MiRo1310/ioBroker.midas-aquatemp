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
var updateDeviceOnError_exports = {};
__export(updateDeviceOnError_exports, {
  updateDeviceErrorMsg: () => updateDeviceErrorMsg
});
module.exports = __toCommonJS(updateDeviceOnError_exports);
var import_axios = __toESM(require("axios"));
var import_saveValue = require("./saveValue");
var import_store = require("./store");
async function updateDeviceErrorMsg() {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const store = (0, import_store.initStore)();
  try {
    const { token, apiLevel, cloudURL, device: deviceCode } = store;
    if (token) {
      const sURL = apiLevel < 3 ? `${cloudURL}/app/device/getFaultDataByDeviceCode.json` : `${cloudURL}/app/device/getFaultDataByDeviceCode`;
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
        await (0, import_saveValue.saveValue)("error", true, "boolean");
        if (apiLevel < 3) {
          await (0, import_saveValue.saveValue)("errorMessage", (_b = (_a = response.data.object_result[0]) == null ? void 0 : _a.description) != null ? _b : "", "string");
          await (0, import_saveValue.saveValue)("errorCode", (_c = response.data.object_result[0]) == null ? void 0 : _c.fault_code, "string");
          await (0, import_saveValue.saveValue)("errorLevel", (_d = response.data.object_result[0]) == null ? void 0 : _d.error_level, "string");
          return;
        }
        await (0, import_saveValue.saveValue)("errorMessage", (_f = (_e = response.data.objectResult[0]) == null ? void 0 : _e.description) != null ? _f : "", "string");
        await (0, import_saveValue.saveValue)("errorCode", (_g = response.data.objectResult[0]) == null ? void 0 : _g.fault_code, "string");
        await (0, import_saveValue.saveValue)("errorLevel", (_h = response.data.objectResult[0]) == null ? void 0 : _h.error_level, "string");
        return;
      }
      store.resetOnErrorHandler();
      return;
    }
    return;
  } catch (error) {
    store._this.log.error(JSON.stringify(error));
    store._this.log.error(JSON.stringify(error.stack));
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceErrorMsg
});
//# sourceMappingURL=updateDeviceOnError.js.map
