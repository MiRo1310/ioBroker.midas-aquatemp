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
  Store: () => Store
});
module.exports = __toCommonJS(store_exports);
var import_crypto = require("crypto");
var import_logging = require("./logging");
const states = {
  error: "boolean",
  mode: "number",
  errorLevel: "number",
  errorCode: "string",
  errorMessage: "string",
  DeviceCode: "string",
  ProductCode: "string",
  rawJSON: "string",
  "info.connection": "boolean",
  consumption: "number",
  state: "boolean",
  suctionTemp: "number",
  tempIn: "number",
  tempOut: "number",
  tempSet: "number",
  coilTemp: "number",
  ambient: "number",
  voltage: "number",
  rotor: "number",
  silent: "boolean",
  flowSwitch: "boolean"
};
class Store {
  constructor(adapter, username, password, instance, apiLevel, useDeviceMac, deviceMac) {
    this.adapter = adapter;
    this.username = username;
    this.encryptedPassword = this.encryptPassword(password);
    this.instance = instance;
    this.apiLevel = apiLevel != null ? apiLevel : this.apiLevel;
    this.useDeviceMac = useDeviceMac != null ? useDeviceMac : this.useDeviceMac;
    if (useDeviceMac) {
      this.device = deviceMac != null ? deviceMac : this.device;
    }
    this.setupEndpoints();
    this.logger = new import_logging.Logger(this.adapter);
  }
  static modes = [-1, 0, 1, 2];
  static AQUATEMP_POOLSANA = "1132174963097280512";
  //Midas/Poolsana InverPro
  static AQUATEMP_OTHER1 = "1442284873216843776";
  instance;
  apiLevel = 3;
  useDeviceMac = false;
  encryptedPassword;
  cloudURL = null;
  device;
  product = null;
  reachable = false;
  mode = 2;
  logger;
  tokenManager;
  setTokenManager(tokenManager) {
    this.tokenManager = tokenManager;
  }
  getDpRoot = () => {
    return `midas-aquatemp.${this.instance}`;
  };
  resetOnError = async () => {
    var _a;
    (_a = this.tokenManager) == null ? void 0 : _a.resetToken();
    this.device = "";
    this.reachable = false;
    await this.saveValue("info.connection", false);
  };
  async resetAndHandleErrorWithSentry(title, e) {
    await this.resetOnError();
    this.logger.errorHandler(title, e);
  }
  setMode(mode) {
    this.mode = mode;
  }
  getMode() {
    return this.mode;
  }
  isValidMode(curr) {
    return Store.modes.includes(curr);
  }
  saveValue = async (key, value) => {
    try {
      const dp = `${this.getDpRoot()}.${key}`;
      await this.adapter.setObjectNotExists(dp, {
        type: "state",
        common: {
          name: key,
          type: states[key],
          role: "value",
          read: true,
          write: false
        },
        native: {}
      });
      await this.adapter.setState(dp, value != null ? value : null, true);
    } catch (err) {
      this.logger.errorHandler("Error in saveValue", err);
    }
  };
  async clearStateValues() {
    await this.saveValue("error", true);
    await this.saveValue("consumption", 0);
    await this.saveValue("state", false);
    await this.saveValue("rawJSON", null);
  }
  getSUrl() {
    return this.apiLevel < 3 ? `${this.cloudURL}/app/device/control.json` : `${this.cloudURL}/app/device/control`;
  }
  getSUrlUpdateDeviceId() {
    return this.apiLevel < 3 ? `${this.cloudURL}/app/device/getDataByCode.json` : `${this.cloudURL}/app/device/getDataByCode`;
  }
  getOptionsAndSUrl() {
    const options = { password: this.encryptedPassword, type: "2" };
    return this.apiLevel < 3 ? {
      sUrl: `${this.cloudURL}/app/user/login.json`,
      options: {
        user_name: this.username,
        ...options
      }
    } : {
      sUrl: `${this.cloudURL}/app/user/login`,
      options: {
        userName: this.username,
        ...options
      }
    };
  }
  getUpdateDeviceStatusSUrl() {
    return this.apiLevel < 3 ? `${this.cloudURL}/app/device/getDeviceStatus.json` : `${this.cloudURL}/app/device/getDeviceStatus`;
  }
  getUpdateDeviceIdSUrl() {
    return this.apiLevel < 3 ? `${this.cloudURL}/app/device/deviceList.json` : `${this.cloudURL}/app/device/deviceList`;
  }
  encryptPassword(password) {
    return (0, import_crypto.createHash)("md5").update(password).digest("hex");
  }
  setupEndpoints() {
    this.cloudURL = this.apiLevel == 3 ? "https://cloud.linked-go.com:449/crmservice/api" : "https://cloud.linked-go.com/cloudservice/api";
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Store
});
//# sourceMappingURL=store.js.map
