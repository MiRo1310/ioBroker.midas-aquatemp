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
var encryptPassword_exports = {};
__export(encryptPassword_exports, {
  encryptPassword: () => encryptPassword
});
module.exports = __toCommonJS(encryptPassword_exports);
var import_crypto = require("crypto");
var import_store = require("./store");
function encryptPassword(password) {
  const store = (0, import_store.initStore)();
  store.encryptedPassword = (0, import_crypto.createHash)("md5").update(password).digest("hex");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  encryptPassword
});
//# sourceMappingURL=encryptPassword.js.map
