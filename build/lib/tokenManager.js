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
var tokenManager_exports = {};
__export(tokenManager_exports, {
  TokenManager: () => TokenManager
});
module.exports = __toCommonJS(tokenManager_exports);
var import_endPoints = require("./endPoints");
var import_logging = require("./logging");
var import_axios = require("./axios");
var import_utils = require("./utils");
class TokenManager {
  constructor(store) {
    this.store = store;
    store.setTokenManager(this);
  }
  token = null;
  deviceController;
  setDeviceController(deviceController) {
    this.deviceController = deviceController;
  }
  async fetchToken() {
    var _a, _b, _c, _d;
    const { adapter, resetOnErrorHandler } = this.store;
    try {
      if (this.isValidToken()) {
        return;
      }
      adapter.log.debug("Request token");
      const { sUrl, options } = (0, import_endPoints.getOptionsAndSUrl)(this.store);
      const { data, error } = await (0, import_axios.request)(adapter, sUrl, options);
      if (error || !data) {
        adapter.log.error(`Login-error: ${JSON.stringify(data)}`);
        await resetOnErrorHandler();
        return;
      }
      const token = (_d = (_c = (_a = data == null ? void 0 : data.object_result) == null ? void 0 : _a["x-token"]) != null ? _c : (_b = data == null ? void 0 : data.objectResult) == null ? void 0 : _b["x-token"]) != null ? _d : null;
      this.token = token;
      if (token) {
        adapter.log.debug("Login ok! Token");
      } else {
        adapter.log.error(`Login-error: ${JSON.stringify(data)}`);
        await resetOnErrorHandler();
      }
    } catch (error) {
      (0, import_logging.errorLogger)("Error in getToken", error, adapter);
    }
  }
  updateToken = async () => {
    const { adapter, useDeviceMac } = this.store;
    try {
      await this.fetchToken();
      if (!this.isValidToken()) {
        return;
      }
      if (!this.deviceController) {
        this.store.adapter.log.debug("DeviceController not set");
        return;
      }
      if (useDeviceMac) {
        await this.deviceController.updateDeviceStatus();
        return;
      }
      await this.deviceController.updateDeviceID();
    } catch (error) {
      (0, import_logging.errorLogger)("Error in updateToken", error, adapter);
    }
  };
  resetToken = () => {
    this.token = null;
  };
  getValidTokenOrNull = () => {
    if (this.isValidToken()) {
      return this.token;
    }
    this.store.adapter.log.debug("No valid token available");
    return null;
  };
  isValidToken() {
    return (0, import_utils.isDefined)(this.token) && this.token !== "";
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TokenManager
});
//# sourceMappingURL=tokenManager.js.map
