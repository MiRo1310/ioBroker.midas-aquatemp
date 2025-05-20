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
var token_exports = {};
__export(token_exports, {
  updateToken: () => updateToken
});
module.exports = __toCommonJS(token_exports);
var import_axios = __toESM(require("axios"));
var import_endPoints = require("./endPoints");
var import_store = require("./store");
var import_updateDeviceId = require("./updateDeviceId");
var import_updateDeviceStatus = require("./updateDeviceStatus");
async function getToken() {
  var _a, _b, _c, _d;
  const store = (0, import_store.initStore)();
  const _this = store._this;
  try {
    const { token, apiLevel } = store;
    if (!token) {
      _this.log.debug("Request token");
      const { sUrl, options } = (0, import_endPoints.getOptionsAndSUrl)();
      const response = await import_axios.default.post(sUrl, options);
      if (!response) {
        _this.log.error("No response from server");
        return;
      }
      if (response.status == 200) {
        store.token = apiLevel < 3 ? (_b = (_a = response.data) == null ? void 0 : _a.object_result) == null ? void 0 : _b["x-token"] : store.token = (_d = (_c = response.data) == null ? void 0 : _c.objectResult) == null ? void 0 : _d["x-token"];
        if (store.token) {
          _this.log.debug("Login ok! Token");
        } else {
          _this.log.error("Login-error: " + JSON.stringify(response.data));
        }
        return;
      }
      _this.log.error("Login-error: " + response.data);
      store.resetOnErrorHandler();
      return;
    }
  } catch (error) {
    _this.log.error("Error in getToken(): " + JSON.stringify(error));
  }
}
const updateToken = async () => {
  const store = (0, import_store.initStore)();
  try {
    await getToken();
    if (!store.token) {
      store.resetOnErrorHandler();
      return;
    }
    if (store.useDeviceMac) {
      await (0, import_updateDeviceStatus.updateDeviceStatus)();
      return;
    }
    await (0, import_updateDeviceId.updateDeviceID)();
    return;
  } catch (error) {
    store._this.log.error("Error in updateToken(): " + JSON.stringify(error));
    store._this.log.error("Error in updateToken(): " + JSON.stringify(error.stack));
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateToken
});
//# sourceMappingURL=token.js.map
