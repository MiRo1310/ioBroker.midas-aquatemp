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
  Store: () => Store,
  modes: () => modes
});
module.exports = __toCommonJS(store_exports);
var import_saveValue = require("./saveValue");
var import_crypto = require("crypto");
const modes = [-1, 0, 1, 2];
class Store {
  adapter;
  instance;
  username;
  encryptedPassword;
  interval = 6e4;
  token = null;
  cloudURL = null;
  apiLevel = 3;
  device;
  product = null;
  reachable = false;
  useDeviceMac = false;
  mode = 2;
  AQUATEMP_POOLSANA = "1132174963097280512";
  //Midas/Poolsana InverPro
  AQUATEMP_OTHER1 = "1442284873216843776";
  constructor(adapter, username, password, instance, interval, apiLevel, useDeviceMac, deviceMac) {
    this.adapter = adapter;
    this.username = username;
    this.encryptedPassword = this.encryptPassword(password);
    this.instance = instance;
    this.interval = interval != null ? interval : this.interval;
    this.apiLevel = apiLevel != null ? apiLevel : this.apiLevel;
    this.useDeviceMac = useDeviceMac != null ? useDeviceMac : this.useDeviceMac;
    if (useDeviceMac) {
      this.device = deviceMac != null ? deviceMac : this.device;
    }
  }
  getDpRoot() {
    return `midas-aquatemp.${this.instance}`;
  }
  async resetOnErrorHandler() {
    this.token = null;
    this.device = "";
    this.reachable = false;
    await (0, import_saveValue.saveValue)({ key: "info.connection", value: false, stateType: "boolean", store: this });
  }
  setMode(mode) {
    this.mode = mode;
  }
  getMode() {
    return this.mode;
  }
  isValidMode(curr) {
    return modes.includes(curr);
  }
  encryptPassword(password) {
    return (0, import_crypto.createHash)("md5").update(password).digest("hex");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Store,
  modes
});
//# sourceMappingURL=store.js.map
