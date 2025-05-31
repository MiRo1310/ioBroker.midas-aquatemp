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
var import_store = require("./store");
var import_logging = require("./logging");
var import_utils = require("./utils");
const saveValue = async ({
  key,
  value,
  stateType,
  adapter
}) => {
  const store = (0, import_store.initStore)();
  const dpRoot = store.getDpRoot();
  try {
    const dp = `${dpRoot}.${key}`;
    if (!await adapter.objectExists(dp)) {
      await adapter.setObjectNotExists(dp, {
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
    }
    if ((0, import_utils.isDefined)(value)) {
      await adapter.setState(dp, value, true);
    }
  } catch (err) {
    (0, import_logging.errorLogger)("Error in saveValue", err, adapter);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  saveValue
});
//# sourceMappingURL=saveValue.js.map
