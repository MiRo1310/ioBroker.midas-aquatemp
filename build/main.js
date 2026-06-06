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
var import_deviceController = require("./lib/deviceController");
var import_tokenManager = require("./lib/tokenManager");
var import_apiClient = require("./lib/apiClient");
class MidasAquatemp extends utils.Adapter {
  static instance;
  static tokenRefreshIntervalTime = 36e5;
  updateInterval;
  tokenRefreshInterval;
  interval = 60;
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
    const { username, password, selectApi, useDeviceMac, deviceMac, refresh } = this.config;
    this.interval = refresh != null ? refresh : this.interval;
    if (username === "" || password === "" || password === void 0) {
      this.log.error("Empty Username or Password.");
      return;
    }
    const store = new import_store.Store(this, username, password, this.instance, selectApi, useDeviceMac, deviceMac);
    const apiClient = new import_apiClient.ApiClient(store);
    const tokenManager = new import_tokenManager.TokenManager(store, apiClient);
    const deviceController = new import_deviceController.DeviceController(store, tokenManager, apiClient);
    try {
      tokenManager.setDeviceController(deviceController);
      const modeId = store.getStateIdByKey("mode");
      const currentMode = parseInt(String((_a = await this.getStateAsync(modeId)) == null ? void 0 : _a.val));
      if (store.isValidMode(currentMode)) {
        store.setMode(currentMode);
      }
      this.log.debug(`API-Level: ${this.config.selectApi}`);
      await (0, import_createState.createObjects)(store);
      this.log.info("Objects created");
      await store.clearStateValues();
      await tokenManager.updateTokenAndDeviceId();
      this.updateInterval = this.setInterval(async () => {
        await tokenManager.updateTokenAndDeviceId();
      }, this.interval * 1e3);
      this.tokenRefreshInterval = this.setInterval(async function() {
        tokenManager.resetToken();
        await tokenManager.updateTokenAndDeviceId();
      }, MidasAquatemp.tokenRefreshIntervalTime);
      this.on("stateChange", async (id, state) => {
        if (!state || state.ack) {
          return;
        }
        const silentId = store.getStateIdByKey("silent");
        const stateId = store.getStateIdByKey("state");
        const tempSetId = store.getStateIdByKey("tempSet");
        const relevantIds = [modeId, silentId, stateId, tempSetId];
        if (!relevantIds.includes(id) || !store.device) {
          return;
        }
        await tokenManager.ensureValidToken();
        if (id === modeId) {
          this.log.debug(`Mode: ${JSON.stringify(state)}`);
          if (!(0, import_utils.isStateValue)(state)) {
            this.log.warn(`Ignoring invalid mode state payload for ${id}: ${JSON.stringify(state)}`);
            return;
          }
          const mode = Number(state.val);
          if (!store.isValidMode(mode)) {
            this.log.warn(
              `Ignoring unsupported mode value for ${id}: ${JSON.stringify(state.val)} (allowed: -1, 0, 1, 2)`
            );
            return;
          }
          await deviceController.updateDevicePower(mode);
          await this.setState(id, { ack: true });
        }
        if (id === silentId) {
          this.log.debug(`Silent: ${JSON.stringify(state)}`);
          if ((0, import_utils.isStateValue)(state)) {
            await deviceController.updateDeviceSilent(state.val);
          }
          await this.setState(id, { ack: true });
        }
        if (id === tempSetId) {
          this.log.debug(`TempSet: ${JSON.stringify(state)}`);
          if ((0, import_utils.isStateValue)(state)) {
            await deviceController.updateDeviceSetTemp(state.val);
          }
          await this.setState(id, { ack: true });
        }
        if (id === stateId) {
          this.log.debug(`State: ${JSON.stringify(state)}`);
          if (!state.val) {
            await deviceController.updateDevicePower(-1);
          } else {
            const currentMode2 = parseInt(String(store.getMode()));
            await deviceController.updateDevicePower(currentMode2 >= 0 ? currentMode2 : 0);
          }
          await this.setState(id, { ack: true });
        }
      });
      await this.subscribeStatesAsync(store.getStateIdByKey("mode"));
      await this.subscribeStatesAsync(store.getStateIdByKey("silent"));
      await this.subscribeStatesAsync(store.getStateIdByKey("tempSet"));
      await this.subscribeStatesAsync(store.getStateIdByKey("state"));
    } catch (error) {
      store.logger.errorHandler(`Error in onReady`, error);
    }
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   *
   * @param callback Callback
   */
  onUnload(callback) {
    try {
      this.clearInterval(this.updateInterval);
      this.clearInterval(this.tokenRefreshInterval);
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
