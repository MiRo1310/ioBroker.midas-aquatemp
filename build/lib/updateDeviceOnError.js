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
var updateDeviceOnError_exports = {};
__export(updateDeviceOnError_exports, {
  updateDeviceErrorMsg: () => updateDeviceErrorMsg
});
module.exports = __toCommonJS(updateDeviceOnError_exports);
var import_saveValue = require("./saveValue");
var import_store = require("./store");
var import_logging = require("./logging");
var import_axios = require("./axios");
var import_axiosParameter = require("./axiosParameter");
async function updateDeviceErrorMsg(adapter) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  const store = (0, import_store.initStore)();
  try {
    const { token, apiLevel, cloudURL, device: deviceCode } = store;
    if (token) {
      const sURL = apiLevel < 3 ? `${cloudURL}/app/device/getFaultDataByDeviceCode.json` : `${cloudURL}/app/device/getFaultDataByDeviceCode`;
      const { data } = await (0, import_axios.request)(
        adapter,
        sURL,
        {
          device_code: deviceCode,
          deviceCode
        },
        (0, import_axiosParameter.getHeaders)(token)
      );
      if (!data) {
        return;
      }
      if (data.error_code === "0") {
        await (0, import_saveValue.saveValue)({ key: "error", value: true, stateType: "boolean", adapter });
        if (apiLevel < 3) {
          await (0, import_saveValue.saveValue)({
            key: "errorMessage",
            value: (_c = (_b = (_a = data.object_result) == null ? void 0 : _a[0]) == null ? void 0 : _b.description) != null ? _c : "",
            stateType: "string",
            adapter
          });
          await (0, import_saveValue.saveValue)({
            key: "errorCode",
            value: (_e = (_d = data.object_result) == null ? void 0 : _d[0]) == null ? void 0 : _e.fault_code,
            stateType: "string",
            adapter
          });
          await (0, import_saveValue.saveValue)({
            key: "errorLevel",
            value: (_g = (_f = data.object_result) == null ? void 0 : _f[0]) == null ? void 0 : _g.error_level,
            stateType: "string",
            adapter
          });
          return;
        }
        await (0, import_saveValue.saveValue)({
          key: "errorMessage",
          value: (_j = (_i = (_h = data.objectResult) == null ? void 0 : _h[0]) == null ? void 0 : _i.description) != null ? _j : "",
          stateType: "string",
          adapter
        });
        await (0, import_saveValue.saveValue)({
          key: "errorCode",
          value: (_l = (_k = data.objectResult) == null ? void 0 : _k[0]) == null ? void 0 : _l.faultCode,
          stateType: "string",
          adapter
        });
        await (0, import_saveValue.saveValue)({
          key: "errorLevel",
          value: (_n = (_m = data.objectResult) == null ? void 0 : _m[0]) == null ? void 0 : _n.errorLevel,
          stateType: "string",
          adapter
        });
        return;
      }
      store.resetOnErrorHandler();
      return;
    }
    return;
  } catch (error) {
    (0, import_logging.errorLogger)("Error in updateDeviceErrorMsg", error, adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceErrorMsg
});
//# sourceMappingURL=updateDeviceOnError.js.map
