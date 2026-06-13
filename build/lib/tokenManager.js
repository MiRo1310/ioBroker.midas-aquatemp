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
var import_utils = require("./utils");
var import_apiClient = require("./apiClient");
class TokenManager {
  constructor(store, apiClient) {
    this.store = store;
    this.apiClient = apiClient;
    store.setTokenManager(this);
  }
  token = null;
  deviceController;
  setDeviceController(deviceController) {
    this.deviceController = deviceController;
  }
  async ensureValidToken() {
    if (this.isValidToken()) {
      return;
    }
    try {
      await this.fetchToken();
    } catch (error) {
      throw new import_apiClient.ResetError("GetToken", { cause: error, sendToSentry: !(error instanceof import_apiClient.ApiError) });
    }
  }
  async fetchToken() {
    var _a, _b, _c, _d;
    const { logger } = this.store;
    logger.debug("Requesting new authentication token");
    const { sUrl, options } = this.store.getOptionsAndSUrl();
    const data = await this.apiClient.request(sUrl, options);
    const token = (_d = (_c = (_a = data == null ? void 0 : data.object_result) == null ? void 0 : _a["x-token"]) != null ? _c : (_b = data == null ? void 0 : data.objectResult) == null ? void 0 : _b["x-token"]) != null ? _d : null;
    this.token = token;
    if (token) {
      logger.info("Authentication successful");
    } else {
      logger.error(`Login failed: ${JSON.stringify(data)}`);
      await this.store.resetOnError();
    }
  }
  updateTokenAndDeviceId = async () => {
    try {
      await this.ensureValidToken();
      if (!this.isValidToken()) {
        return;
      }
      if (!this.deviceController) {
        this.store.logger.warn("DeviceController not set \u2014 cannot update device");
        return;
      }
      if (this.store.useDeviceMac) {
        await this.deviceController.updateDeviceStatus();
        return;
      }
      await this.deviceController.fetchDevice();
    } catch (error) {
      await this.store.resetAndHandleErrorWithSentry("Error in updateToken", error);
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
