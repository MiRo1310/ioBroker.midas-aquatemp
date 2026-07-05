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
  findCodeVal: () => findCodeVal,
  findValByCodeArray: () => findValByCodeArray,
  isDefined: () => isDefined,
  isRelevantStateId: () => isRelevantStateId,
  isStateValue: () => isStateValue,
  resolveOnOffMode: () => resolveOnOffMode,
  toFloat: () => toFloat,
  toInt: () => toInt
});
module.exports = __toCommonJS(utils_exports);
const isDefined = (value) => value !== void 0 && value !== null;
const isStateValue = (state) => isDefined(state) && isDefined(state == null ? void 0 : state.val);
const toFloat = (value) => {
  if (value === "" || !isDefined(value)) {
    return NaN;
  }
  const num = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(num) ? num : NaN;
};
const toInt = (value) => {
  if (value === "" || !isDefined(value)) {
    return NaN;
  }
  const num = parseInt(String(value), 10);
  return Number.isFinite(num) ? num : NaN;
};
function findCodeVal(result, code) {
  var _a;
  return (_a = result.find((item) => item.code === code)) == null ? void 0 : _a.value;
}
function resolveOnOffMode(stateVal, storedMode) {
  if (!stateVal) {
    return -1;
  }
  const currentMode = parseInt(String(storedMode));
  return currentMode >= 0 ? currentMode : 1;
}
function isRelevantStateId(id, knownIds, device) {
  return knownIds.includes(id) && !!device;
}
function findValByCodeArray(result, codes) {
  var _a;
  for (const code of codes) {
    const value = (_a = result.find((item) => item.code === code)) == null ? void 0 : _a.value;
    if (!isDefined(value) || value === "") {
      continue;
    }
    return value;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  findCodeVal,
  findValByCodeArray,
  isDefined,
  isRelevantStateId,
  isStateValue,
  resolveOnOffMode,
  toFloat,
  toInt
});
//# sourceMappingURL=utils.js.map
