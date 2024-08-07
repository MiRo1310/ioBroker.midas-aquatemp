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
var saveValue_exports = {};
__export(saveValue_exports, {
  saveValue: () => saveValue
});
module.exports = __toCommonJS(saveValue_exports);
var import_main = require("../main");
var import_store = require("./store");
let _this;
const saveValue = async (key, value, stateType) => {
  const store = (0, import_store.initStore)();
  const dpRoot = store.getDpRoot();
  try {
    if (!_this) {
      _this = import_main.MidasAquatemp.getInstance();
    }
    const dp = dpRoot + "." + key;
    if (!_this.objectExists(dp)) {
      await _this.setObjectNotExists(dp, {
        type: "state",
        common: {
          name: key,
          type: stateType,
          role: "value",
          read: true,
          write: false
        },
        native: {}
      });
      return;
    }
    _this.setState(dp, value, true);
  } catch (err) {
    _this.log.error("Error in saveValue: " + err);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  saveValue
});
//# sourceMappingURL=saveValue.js.map
