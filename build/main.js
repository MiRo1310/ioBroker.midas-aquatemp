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
  static maxIntervalSeconds = 3600;
  static minIntervalSeconds = 60;
  updateInterval;
  tokenRefreshInterval;
  intervalSeconds = 60;
  store;
  silentId;
  stateId;
  tempSetId;
  modeId;
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
    if ((0, import_utils.isDefined)(refresh) && refresh > MidasAquatemp.minIntervalSeconds && refresh <= MidasAquatemp.maxIntervalSeconds) {
      this.intervalSeconds = refresh;
    }
    if (username === "" || password === "" || password === void 0) {
      this.log.error("Empty Username or Password.");
      return;
    }
    this.store = new import_store.Store(this, username, password, this.instance, selectApi, useDeviceMac, deviceMac);
    this.setIds();
    const apiClient = new import_apiClient.ApiClient(this.store);
    const tokenManager = new import_tokenManager.TokenManager(this.store, apiClient);
    const deviceController = new import_deviceController.DeviceController(this.store, tokenManager, apiClient);
    try {
      tokenManager.setDeviceController(deviceController);
      const currentMode = parseInt(String((_a = await this.getStateAsync(this.modeId)) == null ? void 0 : _a.val));
      if (this.store.isValidMode(currentMode)) {
        this.store.setMode(currentMode);
      }
      this.log.info(`API level: ${this.config.selectApi}, refresh interval: ${this.intervalSeconds}s`);
      await (0, import_createState.createObjects)(this.store);
      this.log.info("Objects created");
      await this.store.clearStateValues();
      await tokenManager.updateTokenAndDeviceId();
      this.updateInterval = this.setInterval(async function() {
        await tokenManager.updateTokenAndDeviceId();
      }, this.intervalSeconds * 1e3);
      this.tokenRefreshInterval = this.setInterval(async function() {
        tokenManager.resetToken();
        await tokenManager.updateTokenAndDeviceId();
      }, MidasAquatemp.tokenRefreshIntervalTime);
      this.on("stateChange", async (id, state) => {
        try {
          if (!state || state.ack) {
            return;
          }
          if (!this.isRelevant(id)) {
            return;
          }
          await tokenManager.ensureValidToken();
          if (id === this.modeId) {
            this.log.debug(`Mode: ${JSON.stringify(state)}`);
            if (!(0, import_utils.isStateValue)(state)) {
              this.log.warn(`Ignoring invalid mode state payload for ${id}: ${JSON.stringify(state)}`);
              return;
            }
            const mode = Number(state.val);
            if (!this.store.isValidMode(mode)) {
              this.log.warn(
                `Ignoring unsupported mode value for ${id}: ${JSON.stringify(state.val)} (allowed: -1, 0, 1, 2)`
              );
              return;
            }
            await deviceController.updateDevicePower(mode);
            await this.setState(id, { ack: true });
          } else if (id === this.silentId) {
            this.log.debug(`Silent: ${JSON.stringify(state)}`);
            if ((0, import_utils.isStateValue)(state)) {
              await deviceController.updateDeviceSilent(state.val);
            }
            await this.setState(id, { ack: true });
          } else if (id === this.tempSetId) {
            this.log.debug(`TempSet: ${JSON.stringify(state)}`);
            if ((0, import_utils.isStateValue)(state)) {
              await deviceController.updateDeviceSetTemp(state.val);
            }
            await this.setState(id, { ack: true });
          } else if (id === this.stateId) {
            this.log.debug(`State: ${JSON.stringify(state)}`);
            await deviceController.updateDevicePower(this.getMode(state));
            await this.setState(id, { ack: true });
          }
        } catch (error) {
          if (error instanceof import_apiClient.ResetError) {
            await this.store.resetAndHandleErrorWithSentry(`Error in stateChange (${id})`, error);
            return;
          }
          this.store.logger.errorHandler(`Error in stateChange (${id})`, error);
        }
      });
      await Promise.all([
        this.subscribeStatesAsync(this.store.getStateIdByKey("mode")),
        this.subscribeStatesAsync(this.store.getStateIdByKey("silent")),
        this.subscribeStatesAsync(this.store.getStateIdByKey("tempSet")),
        this.subscribeStatesAsync(this.store.getStateIdByKey("state"))
      ]);
    } catch (error) {
      this.store.logger.errorHandler(`Error in onReady`, error);
    }
  }
  getMode(state) {
    return (0, import_utils.resolveOnOffMode)(state.val, this.store.getMode());
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
  setIds() {
    this.silentId = this.store.getStateIdByKey("silent");
    this.stateId = this.store.getStateIdByKey("state");
    this.tempSetId = this.store.getStateIdByKey("tempSet");
    this.modeId = this.store.getStateIdByKey("mode");
  }
  isRelevant(id) {
    return (0, import_utils.isRelevantStateId)(id, [this.modeId, this.silentId, this.stateId, this.tempSetId], this.store.device);
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
