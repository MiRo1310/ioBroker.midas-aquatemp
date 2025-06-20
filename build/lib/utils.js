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
var utils_exports = {};
__export(utils_exports, {
  isDefined: () => isDefined,
  isStateValue: () => isStateValue,
  isToken: () => isToken,
  noError: () => noError
});
module.exports = __toCommonJS(utils_exports);
const isDefined = (value) => value !== void 0 && value !== null;
const isStateValue = (state) => isDefined(state) && isDefined(state == null ? void 0 : state.val);
const isToken = (token) => isDefined(token) && token !== "";
const noError = (errorCode) => errorCode === "0";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isDefined,
  isStateValue,
  isToken,
  noError
});
//# sourceMappingURL=utils.js.map
