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
var endPoints_exports = {};
__export(endPoints_exports, {
  setupEndpoints: () => setupEndpoints
});
module.exports = __toCommonJS(endPoints_exports);
var import_store = require("./store");
const store = (0, import_store.useStore)();
function setupEndpoints() {
  const apiLevel = store.apiLevel;
  if (apiLevel == 1) {
    store.cloudURL = "https://cloud.linked-go.com/cloudservice/api";
    return;
  }
  if (apiLevel == 2) {
    store.cloudURL = "https://cloud.linked-go.com/cloudservice/api";
    return;
  }
  if (apiLevel == 3) {
    store.cloudURL = "https://cloud.linked-go.com:449/crmservice/api";
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  setupEndpoints
});
//# sourceMappingURL=endPoints.js.map
