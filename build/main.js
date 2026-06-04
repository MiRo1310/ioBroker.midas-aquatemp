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
var main_exports = {};
__export(main_exports, {
  MidasAquatemp: () => MidasAquatemp,
  adapter: () => adapter
});
module.exports = __toCommonJS(main_exports);
var import_store = require("./lib/store");
var utils = __toESM(require("@iobroker/adapter-core"));
var import_createState = require("./lib/createState");
var import_utils = require("./lib/utils");
var import_logging = require("./lib/logging");
var import_deviceController = require("./lib/deviceController");
var import_tokenManager = require("./lib/tokenManager");
var import_axios = require("./lib/axios");
class MidasAquatemp extends utils.Adapter {
  static instance;
  updateInterval;
  tokenRefreshTimer;
  constructor(options = {}) {
    super({
      ...options,
      name: "midas-aquatemp"
    });
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
    MidasAquatemp.instance = this;
  }
  static getInstance() {
    return MidasAquatemp.instance;
  }
  async onReady() {
    var _a;
    await this.setState("info.connection", false, true);
    if (!(0, import_utils.isDefined)(this.instance)) {
      this.log.error("No instance found.");
      return;
    }
    const { username, password, refresh, selectApi, useDeviceMac, deviceMac } = this.config;
    const store = new import_store.Store(this, username, password, this.instance, refresh, selectApi, useDeviceMac, deviceMac);
    const apiClient = new import_axios.ApiClient(store);
    const tokenManager = new import_tokenManager.TokenManager(store, apiClient);
    const deviceController = new import_deviceController.DeviceController(store, tokenManager, apiClient);
    tokenManager.setDeviceController(deviceController);
    const dpRoot = store.getDpRoot();
    const currentMode = parseInt(String((_a = await this.getStateAsync(`${dpRoot}.mode`)) == null ? void 0 : _a.val));
    if (store.isValidMode(currentMode)) {
      store.setMode(currentMode);
    }
    this.log.debug(`API-Level: ${this.config.selectApi}`);
    await (0, import_createState.createObjects)(store);
    this.log.info("Objects created");
    await store.clearStateValues();
    await tokenManager.updateToken();
    this.updateInterval = this.setInterval(async () => {
      try {
        await tokenManager.updateToken();
        const mode = await this.getStateAsync(`${dpRoot}.mode`);
        if (!(mode == null ? void 0 : mode.ack) && (0, import_utils.isDefined)(mode == null ? void 0 : mode.val) && store.device) {
          const modeVal = parseInt(String(mode.val));
          if (!store.isValidMode(modeVal)) {
            return;
          }
          await deviceController.updateDevicePower(modeVal);
        }
        const silent = await this.getStateAsync(`${dpRoot}.silent`);
        if (!(silent == null ? void 0 : silent.ack) && (0, import_utils.isStateValue)(silent) && store.device) {
          await deviceController.updateDeviceSilent(!!(silent == null ? void 0 : silent.val));
        }
      } catch (error) {
        (0, import_logging.errorLogger)("Error in updateInterval", error, this);
      }
    }, store.interval * 1e3);
    this.tokenRefreshTimer = this.setInterval(async function() {
      tokenManager.resetToken();
      await tokenManager.updateToken();
    }, 36e5);
    this.on("stateChange", async (id, state) => {
      try {
        if (!state || state.ack) {
          return;
        }
        const isRelevantId = id === `${dpRoot}.mode` || id === `${dpRoot}.silent` || id === `${dpRoot}.tempSet` || id === `${dpRoot}.state`;
        if (!isRelevantId || !store.device) {
          return;
        }
        await tokenManager.fetchToken();
        if (id === `${dpRoot}.mode`) {
          this.log.debug(`Mode: ${JSON.stringify(state)}`);
          if (!(0, import_utils.isStateValue)(state)) {
            this.log.warn(`Ignoring invalid mode state payload for ${id}: ${JSON.stringify(state)}`);
            return;
          }
          const mode = Number(state.val);
          if (!Number.isFinite(mode) || !Number.isInteger(mode) || !store.isValidMode(mode)) {
            this.log.warn(
              `Ignoring unsupported mode value for ${id}: ${JSON.stringify(state.val)} (allowed: -1, 0, 1, 2)`
            );
            return;
          }
          await deviceController.updateDevicePower(mode);
          await this.setState(id, { ack: true });
        }
        if (id === `${dpRoot}.silent`) {
          this.log.debug(`Silent: ${JSON.stringify(state)}`);
          if ((0, import_utils.isStateValue)(state)) {
            await deviceController.updateDeviceSilent(state.val);
          }
          await this.setState(id, { ack: true });
        }
        if (id === `${dpRoot}.tempSet`) {
          this.log.debug(`TempSet: ${JSON.stringify(state)}`);
          if ((0, import_utils.isStateValue)(state)) {
            await deviceController.updateDeviceSetTemp(state.val);
          }
          await this.setState(id, { ack: true });
        }
        if (id === `${dpRoot}.state`) {
          this.log.debug(`State: ${JSON.stringify(state)}`);
          if ((0, import_utils.isStateValue)(state)) {
            if (!state.val) {
              await deviceController.updateDevicePower(-1);
            } else {
              const currentMode2 = parseInt(String(store.getMode()));
              await deviceController.updateDevicePower(currentMode2 >= 0 ? currentMode2 : 0);
            }
          }
          await this.setState(id, { ack: true });
        }
      } catch (error) {
        (0, import_logging.errorLogger)(`Error in stateChange for ${id}`, error, this);
      }
    });
    await this.subscribeStatesAsync(`${dpRoot}.mode`);
    await this.subscribeStatesAsync(`${dpRoot}.silent`);
    await this.subscribeStatesAsync(`${dpRoot}.tempSet`);
    await this.subscribeStatesAsync(`${dpRoot}.state`);
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   *
   * @param callback Callback
   */
  onUnload(callback) {
    try {
      this.clearInterval(this.updateInterval);
      this.clearInterval(this.tokenRefreshTimer);
      callback();
    } catch (e) {
      callback();
      this.log.error(`Error: ${e.message}`);
    }
  }
}
let adapter;
if (require.main !== module) {
  adapter = (options) => new MidasAquatemp(options);
} else {
  (() => new MidasAquatemp())();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MidasAquatemp,
  adapter
});
//# sourceMappingURL=main.js.map
