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
var import_encryptPassword = require("./lib/encryptPassword");
var import_endPoints = require("./lib/endPoints");
var import_saveValue = require("./lib/saveValue");
var import_token = require("./lib/token");
var import_updateDevicePower = require("./lib/updateDevicePower");
var import_updateDeviceSetTemp = require("./lib/updateDeviceSetTemp");
var import_updateDeviceSilent = require("./lib/updateDeviceSilent");
var import_utils = require("./lib/utils");
let updateIntervall;
let tokenRefreshTimer;
class MidasAquatemp extends utils.Adapter {
  static instance;
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
    const store = (0, import_store.initStore)();
    const adapter2 = this;
    store._this = this;
    store.instance = this.instance;
    const dpRoot = store.getDpRoot();
    await this.setState("info.connection", false, true);
    store.username = this.config.username;
    const password = this.config.password;
    store.interval = this.config.refresh;
    store.apiLevel = this.config.selectApi;
    if (this.config.useDeviceMac) {
      store.device = this.config.deviceMac;
    }
    store.useDeviceMac = this.config.useDeviceMac;
    this.log.debug(`API-Level: ${this.config.selectApi}`);
    (0, import_endPoints.setupEndpoints)();
    (0, import_encryptPassword.encryptPassword)(password);
    await (0, import_createState.createObjects)(adapter2);
    this.log.info("Objects created");
    await clearValues();
    await (0, import_token.updateToken)(adapter2);
    async function clearValues() {
      await (0, import_saveValue.saveValue)("error", true, "boolean", adapter2);
      await (0, import_saveValue.saveValue)("consumption", 0, "number", adapter2);
      await (0, import_saveValue.saveValue)("state", false, "boolean", adapter2);
      await (0, import_saveValue.saveValue)("rawJSON", null, "string", adapter2);
    }
    updateIntervall = store._this.setInterval(async () => {
      try {
        await (0, import_token.updateToken)(adapter2);
        const mode = await store._this.getStateAsync(`${dpRoot}.mode`);
        if (mode && !mode.ack && mode.val) {
          await (0, import_updateDevicePower.updateDevicePower)(adapter2, store.device, mode.val);
        }
        const silent = await this.getStateAsync(`${dpRoot}.silent`);
        if (silent && !silent.ack && silent.val) {
          await (0, import_updateDevicePower.updateDevicePower)(adapter2, store.device, silent.val);
        }
      } catch (error) {
        store._this.log.error(JSON.stringify(error));
        store._this.log.error(JSON.stringify(error.stack));
      }
    }, store.interval * 1e3);
    tokenRefreshTimer = this.setInterval(async function() {
      store.token = "";
      store._this.log.debug("Token will be refreshed.");
      await (0, import_token.updateToken)(adapter2);
    }, 36e5);
    this.on("stateChange", async (id, state) => {
      try {
        if (!state || state.ack) {
          return;
        }
        if (id === `${dpRoot}.mode`) {
          this.log.debug(`Mode: ${JSON.stringify(state)}`);
          if ((0, import_utils.isStateValue)(state)) {
            const mode = parseInt(state.val);
            await (0, import_updateDevicePower.updateDevicePower)(adapter2, store.device, mode);
          }
          await this.setState(id, { ack: true });
        }
        if (id === `${dpRoot}.silent`) {
          this.log.debug(`Silent: ${JSON.stringify(state)}`);
          if ((0, import_utils.isStateValue)(state)) {
            await (0, import_updateDeviceSilent.updateDeviceSilent)(adapter2, store.device, state.val);
          }
          await this.setState(id, { ack: true });
        }
        if (id === `${dpRoot}.tempSet`) {
          this.log.debug(`TempSet: ${JSON.stringify(state)}`);
          if ((0, import_utils.isStateValue)(state)) {
            await (0, import_updateDeviceSetTemp.updateDeviceSetTemp)(adapter2, store.device, state.val);
          }
          await this.setState(id, { ack: true });
        }
      } catch (error) {
        store._this.log.error(JSON.stringify(error));
        store._this.log.error(JSON.stringify(error.stack));
      }
    });
    await this.subscribeStatesAsync(`${dpRoot}.mode`);
    await this.subscribeStatesAsync(`${dpRoot}.silent`);
    await this.subscribeStatesAsync(`${dpRoot}.tempSet`);
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   *
   * @param callback Callback
   */
  onUnload(callback) {
    try {
      this.clearInterval(updateIntervall);
      this.clearInterval(tokenRefreshTimer);
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
