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
  ApiClient: () => ApiClient
});
module.exports = __toCommonJS(apiClient_exports);
var import_axios = __toESM(require("axios"));
var import_https = __toESM(require("https"));
var import_logging = require("./logging");
class ApiClient {
  constructor(store) {
    this.store = store;
  }
  static insecureHttpsAgent = new import_https.default.Agent({ rejectUnauthorized: false });
  insecureTlsWarningShown = false;
  parseBooleanEnv(value) {
    return value === "1" || value === "true" || value === "yes" || value === "on";
  }
  getInsecureTlsHostAllowlist() {
    var _a;
    return ((_a = process.env.MIDAS_AQUATEMP_INSECURE_TLS_HOSTS) != null ? _a : "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean);
  }
  isInsecureTlsEnabled() {
    return this.store.adapter.config.allowInsecureTls === true || this.parseBooleanEnv(process.env.MIDAS_AQUATEMP_INSECURE_TLS);
  }
  canUseInsecureTlsForUrl(url) {
    const allowlist = this.getInsecureTlsHostAllowlist();
    if (allowlist.length === 0) {
      return true;
    }
    try {
      const { hostname } = new URL(url);
      return allowlist.includes(hostname.toLowerCase());
    } catch {
      return false;
    }
  }
  getHttpsAgent(url) {
    if (!this.isInsecureTlsEnabled() || !this.canUseInsecureTlsForUrl(url)) {
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
  async request(url, options, token) {
    var _a;
    try {
      const tokenHeader = token ? { "x-token": token } : {};
      const result = await import_axios.default.post(url, options, {
        headers: {
          "Content-Type": "application/json",
          ...tokenHeader
        },
        httpsAgent: this.getHttpsAgent(url)
      });
      if (result.status !== 200) {
        return { error: true, status: result.status, data: result.data };
      }
      if (!ApiClient.isApiSuccess((_a = result.data) == null ? void 0 : _a.error_code)) {
        this.store.adapter.log.debug(`API error for ${url}: ${JSON.stringify(result.data)}`);
        return { error: true, status: result.status, data: result.data };
      }
      return { error: false, status: result.status, data: result.data };
    } catch (e) {
      (0, import_logging.errorLogger)("Axios request error", e, this.store.adapter);
      return { status: 500, data: void 0, error: true };
    }
  }
  static isApiSuccess(errorCode) {
    return errorCode === void 0 || errorCode === null || parseInt(String(errorCode), 10) === 0;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiClient
});
//# sourceMappingURL=apiClient.js.map
