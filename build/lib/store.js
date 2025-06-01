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
var store_exports = {};
__export(store_exports, {
  initStore: () => initStore
});
module.exports = __toCommonJS(store_exports);
var import_saveValue = require("./saveValue");
let store;
function initStore() {
  if (!store) {
    store = {
      adapter: "",
      token: "",
      instance: null,
      username: "",
      encryptedPassword: "",
      cloudURL: "",
      apiLevel: 3,
      interval: 6e4,
      device: void 0,
      product: void 0,
      reachable: false,
      useDeviceMac: false,
      // ProductIDs:
      // Gruppe 1:
      // 1132174963097280512: Midas/Poolsana InverPro
      AQUATEMP_POOLSANA: "1132174963097280512",
      // Gruppe 2:
      // 1442284873216843776:
      AQUATEMP_OTHER1: "1442284873216843776",
      getDpRoot: function() {
        return `midas-aquatemp.${this.instance}`;
      },
      resetOnErrorHandler: async function() {
        this.token = "";
        this.device = "";
        this.reachable = false;
        await (0, import_saveValue.saveValue)({ key: "info.connection", value: false, stateType: "boolean", adapter: this.adapter });
      }
    };
  }
  return store;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  initStore
});
//# sourceMappingURL=store.js.map
