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
var axios_exports = {};
__export(axios_exports, {
  request: () => request
});
module.exports = __toCommonJS(axios_exports);
var import_axios = __toESM(require("axios"));
var import_logging = require("./logging");
const request = async (adapter, url, options = {}, header = { headers: {} }) => {
  try {
    const result = await import_axios.default.post(url, options, header);
    if (result.status === 200) {
      adapter.log.debug(`Axios request successful: ${JSON.stringify(result.data)}`);
    }
    if (result.status === 504) {
      adapter.log.warn(`Axios request timed out: ${url}`);
    }
    return { status: result.status, data: result.data };
  } catch (e) {
    (0, import_logging.errorLogger)("Axios request error", e, adapter);
    return { status: 500, data: void 0 };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  request
});
//# sourceMappingURL=axios.js.map
