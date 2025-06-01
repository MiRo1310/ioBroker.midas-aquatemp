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
var updateDeviceId_exports = {};
__export(updateDeviceId_exports, {
  updateDeviceID: () => updateDeviceID
});
module.exports = __toCommonJS(updateDeviceId_exports);
var import_axiosParameter = require("./axiosParameter");
var import_endPoints = require("./endPoints");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
var import_updateDeviceStatus = require("./updateDeviceStatus");
var import_logging = require("./logging");
var import_axios = require("./axios");
var import_utils = require("./utils");
async function updateDeviceID(adapter) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
  const store = (0, import_store.initStore)();
  try {
    const { token } = store;
    if (!(0, import_utils.isToken)(token)) {
      return;
    }
    const { data, status, error } = await (0, import_axios.request)(
      adapter,
      (0, import_endPoints.getUpdateDeviceIdSUrl)().sURL,
      (0, import_axiosParameter.getAxiosUpdateDeviceIdParams)(),
      (0, import_axiosParameter.getHeaders)(token)
    );
    adapter.log.debug(`UpdateDeviceID response: ${JSON.stringify(data)}, status: ${status}`);
    if (!data || error) {
      store.resetOnErrorHandler();
      return;
    }
    if (!((_b = (_a = data == null ? void 0 : data.object_result) == null ? void 0 : _a[0]) == null ? void 0 : _b.device_code) && !((_d = (_c = data == null ? void 0 : data.objectResult) == null ? void 0 : _c[0]) == null ? void 0 : _d.deviceCode)) {
      adapter.log.error("Error in updateDeviceID: No device code found");
      return;
    }
    store.device = (_h = (_e = data.object_result) == null ? void 0 : _e[0].device_code) != null ? _h : (_g = (_f = data.objectResult) == null ? void 0 : _f[0]) == null ? void 0 : _g.deviceCode;
    store.product = (_m = (_j = (_i = data.object_result) == null ? void 0 : _i[0]) == null ? void 0 : _j.product_id) != null ? _m : (_l = (_k = data.objectResult) == null ? void 0 : _k[0]) == null ? void 0 : _l.productId;
    store.reachable = ((_r = (_o = (_n = data.object_result) == null ? void 0 : _n[0]) == null ? void 0 : _o.device_status) != null ? _r : (_q = (_p = data.objectResult) == null ? void 0 : _p[0]) == null ? void 0 : _q.deviceStatus) == "ONLINE";
    adapter.log.debug(`device: ${store.device}, product: ${store.product}, reachable: ${store.reachable}`);
    await (0, import_saveValue.saveValue)({ key: "DeviceCode", value: store.device, stateType: "string", adapter });
    await (0, import_saveValue.saveValue)({ key: "ProductCode", value: store.product, stateType: "string", adapter });
    if (store.reachable && store.device) {
      await (0, import_saveValue.saveValue)({ key: "info.connection", value: true, stateType: "boolean", adapter });
      if (store.device != "" && store.product) {
        await (0, import_updateDeviceStatus.updateDeviceStatus)(adapter);
      }
      return;
    }
    adapter.log.debug("Device not reachable");
    store.resetOnErrorHandler();
  } catch (error) {
    (0, import_logging.errorLogger)("Error in updateDeviceID", error, adapter);
    store.token = "";
    store.device = "";
    store.reachable = false;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceID
});
//# sourceMappingURL=updateDeviceId.js.map
