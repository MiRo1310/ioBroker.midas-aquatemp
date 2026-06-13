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
var loggingController_exports = {};
__export(loggingController_exports, {
  Logger: () => Logger
});
module.exports = __toCommonJS(loggingController_exports);
var import_apiClient = require("./apiClient");
class Logger {
  constructor(adapter) {
    this.adapter = adapter;
  }
  error(msg) {
    this.adapter.log.error(msg);
  }
  debug(msg) {
    this.adapter.log.debug(msg);
  }
  warn(msg) {
    this.adapter.log.warn(msg);
  }
  info(msg) {
    this.adapter.log.info(msg);
  }
  shouldSendToSentry(e) {
    if (e instanceof import_apiClient.ApiError) {
      return false;
    }
    if (e instanceof import_apiClient.ResetError) {
      return e.sendToSentry;
    }
    return true;
  }
  errorHandler(title, e, useSentry = true) {
    var _a, _b;
    if (useSentry && this.shouldSendToSentry(e)) {
      this.sendToSentry(e);
    }
    this.adapter.log.error(title);
    this.error(`Error message: ${e.message}`);
    this.error(`Error stack: ${e.stack}`);
    if (e == null ? void 0 : e.response) {
      this.error(`Server response: ${(_a = e == null ? void 0 : e.response) == null ? void 0 : _a.status}`);
      this.error(`Server status: ${(_b = e == null ? void 0 : e.response) == null ? void 0 : _b.statusText}`);
    }
  }
  sendToSentry(e) {
    var _a;
    if (this.adapter.supportsFeature && this.adapter.supportsFeature("PLUGINS")) {
      const sentryInstance = this.adapter.getPluginInstance("sentry");
      if (sentryInstance) {
        (_a = sentryInstance.getSentryObject()) == null ? void 0 : _a.captureException(e);
      }
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Logger
});
//# sourceMappingURL=loggingController.js.map
