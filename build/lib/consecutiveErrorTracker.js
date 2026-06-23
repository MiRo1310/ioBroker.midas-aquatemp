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
var consecutiveErrorTracker_exports = {};
__export(consecutiveErrorTracker_exports, {
  ConsecutiveErrorTracker: () => ConsecutiveErrorTracker
});
module.exports = __toCommonJS(consecutiveErrorTracker_exports);
class ConsecutiveErrorTracker {
  constructor(cb, adapter, acceptedErrors = 4) {
    this.cb = cb;
    this.adapter = adapter;
    this.acceptedErrors = acceptedErrors;
  }
  errors = [];
  async addError(e) {
    this.errors.push(e);
    this.adapter.log.debug(`Error message: ${e.message}`);
    this.adapter.log.debug(`Error stack: ${e.stack}`);
    if (this.errors.length > this.acceptedErrors) {
      await this.sendError(e);
      this.resetErrors();
    }
  }
  resetErrors() {
    this.errors = [];
  }
  async sendError(error) {
    await this.cb(error);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConsecutiveErrorTracker
});
//# sourceMappingURL=consecutiveErrorTracker.js.map
