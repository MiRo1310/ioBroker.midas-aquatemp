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
var apiClient_exports = {};
__export(apiClient_exports, {
  ApiClient: () => ApiClient,
  ApiError: () => ApiError,
  ResetError: () => ResetError
});
module.exports = __toCommonJS(apiClient_exports);
var import_axios = __toESM(require("axios"));
var import_node_https = __toESM(require("node:https"));
class ApiError extends Error {
  constructor(errorCode, url) {
    super(`API error ${errorCode} for ${url}`);
    this.errorCode = errorCode;
    this.name = "ApiError";
  }
}
class ResetError extends Error {
  sendToSentry;
  constructor(message, options) {
    var _a;
    super(message, options);
    this.name = "ResetError";
    this.sendToSentry = (_a = options == null ? void 0 : options.sendToSentry) != null ? _a : true;
  }
}
class ApiClient {
  constructor(store) {
    this.store = store;
  }
  static insecureHttpsAgent = new import_node_https.default.Agent({ rejectUnauthorized: false });
  static DEFAULT_TIMEOUT = 10 * 1e3;
  insecureTlsWarningShown = false;
  isInsecureTlsEnabled() {
    return this.store.adapter.config.allowInsecureTls === true;
  }
  getHttpsAgent() {
    if (!this.isInsecureTlsEnabled()) {
      return;
    }
    if (!this.insecureTlsWarningShown) {
      this.store.adapter.log.warn(
        "Insecure TLS mode is enabled (certificate verification disabled). Use only for trusted endpoints."
      );
      this.insecureTlsWarningShown = true;
    }
    return ApiClient.insecureHttpsAgent;
  }
  async request(url, data, token) {
    var _a, _b, _c, _d;
    const tokenHeader = token ? { "x-token": token } : {};
    const result = await import_axios.default.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        ...tokenHeader
      },
      httpsAgent: this.getHttpsAgent(),
      timeout: ApiClient.DEFAULT_TIMEOUT
    });
    if (result.status !== 200) {
      throw new Error(`HTTP error ${result.status} for ${url}`);
    }
    if (!result.data) {
      throw new Error("No response returned");
    }
    if (!ApiClient.isApiSuccess((_a = result.data) == null ? void 0 : _a.error_code)) {
      this.store.adapter.log.warn(
        `API error ${(_b = result.data) == null ? void 0 : _b.error_code} for ${url}: ${JSON.stringify(result.data)}`
      );
      throw new ApiError((_d = (_c = result.data) == null ? void 0 : _c.error_code) != null ? _d : "unknown", url);
    }
    return result.data;
  }
  static isApiSuccess(errorCode) {
    return errorCode === void 0 || errorCode === null || parseInt(String(errorCode), 10) === 0;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiClient,
  ApiError,
  ResetError
});
//# sourceMappingURL=apiClient.js.map
