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
var updateDeviceId_exports = {};
__export(updateDeviceId_exports, {
  updateDeviceID: () => updateDeviceID
});
module.exports = __toCommonJS(updateDeviceId_exports);
var import_axios = __toESM(require("axios"));
var import_main = require("../main");
var import_axiosParameter = require("./axiosParameter");
var import_endPoints = require("./endPoints");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
var import_updateDeviceStatus = require("./updateDeviceStatus");
let _this;
async function updateDeviceID() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
  const store = (0, import_store.initStore)();
  try {
    if (!_this) {
      _this = import_main.MidasAquatemp.getInstance();
    }
    const { token, apiLevel } = store;
    if (!token) {
      return;
    }
    const { sURL } = (0, import_endPoints.getUpdateDeviceIdSUrl)();
    const options = (0, import_axiosParameter.getAxiosUpdateDeviceIdParams)();
    _this.log.debug(`UpdateDeviceID URL: ${sURL}`);
    _this.log.debug(`UpdateDeviceID options: ${JSON.stringify(options)}`);
    const response = await import_axios.default.post(sURL, options, {
      headers: { "x-token": token }
    });
    _this.log.debug(`UpdateDeviceID response: ${JSON.stringify(response.data)}`);
    _this.log.debug(`UpdateDeviceID response status: ${JSON.stringify(response.status)}`);
    if (!response || response.status !== 200 || response.data.error_code !== "0") {
      store.resetOnErrorHandler();
      return;
    }
    if (!((_c = (_b = (_a = response.data) == null ? void 0 : _a.object_result) == null ? void 0 : _b[0]) == null ? void 0 : _c.device_code) && !((_f = (_e = (_d = response.data) == null ? void 0 : _d.objectResult) == null ? void 0 : _e[0]) == null ? void 0 : _f.deviceCode)) {
      _this.log.error("Error in updateDeviceID(): No device code found");
      _this.log.error(`Response: ${JSON.stringify(response.data)}`);
      return;
    }
    if (apiLevel < 3) {
      store.device = (_g = response.data.object_result[0]) == null ? void 0 : _g.device_code;
      store.product = (_h = response.data.object_result[0]) == null ? void 0 : _h.product_id;
      store.reachable = ((_i = response.data.object_result[0]) == null ? void 0 : _i.device_status) == "ONLINE";
    } else {
      store.device = (_j = response.data.objectResult[0]) == null ? void 0 : _j.deviceCode;
      store.product = (_k = response.data.objectResult[0]) == null ? void 0 : _k.productId;
      store.reachable = ((_l = response.data.objectResult[0]) == null ? void 0 : _l.deviceStatus) == "ONLINE";
    }
    _this.log.debug(`Device: ${store.device}`);
    _this.log.debug(`Product: ${store.product}`);
    _this.log.debug(`Reachable: ${store.reachable}`);
    await (0, import_saveValue.saveValue)("DeviceCode", store.device, "string");
    await (0, import_saveValue.saveValue)("ProductCode", store.product, "string");
    if (store.reachable && store.device) {
      await (0, import_saveValue.saveValue)("info.connection", true, "boolean");
      if (store.device != "" && store.product) {
        _this.log.debug("Update device status");
        await (0, import_updateDeviceStatus.updateDeviceStatus)();
      }
      return;
    }
    _this.log.debug("Device not reachable");
    store.resetOnErrorHandler();
  } catch (error) {
    _this.log.error(`Error in updateDeviceID(): ${JSON.stringify(error)}`);
    _this.log.error(`Error in updateDeviceID(): ${JSON.stringify(error.stack)}`);
    store.token = "", store.device = "", store.reachable = false;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceID
});
//# sourceMappingURL=updateDeviceId.js.map
