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
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
  const store = (0, import_store.initStore)();
  try {
    const { token, apiLevel, cloudURL, device: deviceCode } = store;
    if (!token) {
      return;
    }
    const sURL = apiLevel < 3 ? `${cloudURL}/app/device/getFaultDataByDeviceCode.json` : `${cloudURL}/app/device/getFaultDataByDeviceCode`;
    const { data, error } = await (0, import_axios.request)(
      adapter,
      sURL,
      {
        device_code: deviceCode,
        deviceCode
      },
      (0, import_axiosParameter.getHeaders)(token)
    );
    if (!data || error) {
      store.resetOnErrorHandler();
      return;
    }
    await (0, import_saveValue.saveValue)({ key: "error", value: true, stateType: "boolean", adapter });
    await (0, import_saveValue.saveValue)({
      key: "errorMessage",
      value: (_f = (_e = (_b = (_a = data.objectResult) == null ? void 0 : _a[0]) == null ? void 0 : _b.description) != null ? _e : (_d = (_c = data.object_result) == null ? void 0 : _c[0]) == null ? void 0 : _d.description) != null ? _f : "",
      stateType: "string",
      adapter
    });
    await (0, import_saveValue.saveValue)({
      key: "errorCode",
      value: (_k = (_h = (_g = data.objectResult) == null ? void 0 : _g[0]) == null ? void 0 : _h.faultCode) != null ? _k : (_j = (_i = data.object_result) == null ? void 0 : _i[0]) == null ? void 0 : _j.fault_code,
      stateType: "string",
      adapter
    });
    await (0, import_saveValue.saveValue)({
      key: "errorLevel",
      value: (_p = (_m = (_l = data.objectResult) == null ? void 0 : _l[0]) == null ? void 0 : _m.errorLevel) != null ? _p : (_o = (_n = data.object_result) == null ? void 0 : _n[0]) == null ? void 0 : _o.error_level,
      stateType: "string",
      adapter
    });
  } catch (error) {
    (0, import_logging.errorLogger)("Error in updateDeviceErrorMsg", error, adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceErrorMsg
});
//# sourceMappingURL=updateDeviceOnError.js.map
