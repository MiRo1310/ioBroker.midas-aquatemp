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
  MidasAquatemp: () => MidasAquatemp
});
module.exports = __toCommonJS(main_exports);
var import_store = require("./lib/store");
var utils = __toESM(require("@iobroker/adapter-core"));
var import_axios = __toESM(require("axios"));
var import_axiosParameter = require("./lib/axiosParameter");
var import_createState = require("./lib/createState");
var import_encryptPassword = require("./lib/encryptPassword");
var import_endPoints = require("./lib/endPoints");
var import_saveValue = require("./lib/saveValue");
var import_token = require("./lib/token");
var import_utils = require("./lib/utils");
const store = (0, import_store.initStore)();
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
    store._this = this;
    store.instance = this.instance;
    const dpRoot = store.getDpRoot();
    this.setState("info.connection", false, true);
    store.username = this.config.username;
    const password = this.config.password;
    store.interval = this.config.refresh;
    store.apiLevel = this.config.selectApi;
    (0, import_endPoints.setupEndpoints)();
    (0, import_encryptPassword.encryptPassword)(password);
    (0, import_createState.createObjects)();
    clearValues();
    await (0, import_token.updateToken)();
    function clearValues() {
      (0, import_saveValue.saveValue)("error", true, "boolean");
      (0, import_saveValue.saveValue)("consumption", 0, "number");
      (0, import_saveValue.saveValue)("state", false, "boolean");
      (0, import_saveValue.saveValue)("rawJSON", null, "string");
    }
    async function updateDevicePower(deviceCode, power) {
      try {
        const token = store.token;
        const { powerMode, powerOpt } = (0, import_utils.getPowerMode)(power);
        if (powerOpt === null || powerMode === null) {
          return;
        }
        if (token && token != "") {
          const { sURL } = (0, import_endPoints.getSUrl)();
          const response = await import_axios.default.post(
            sURL,
            (0, import_axiosParameter.getAxiosUpdateDevicePowerParams)({ deviceCode, value: powerOpt, protocolCode: "Power" }),
            {
              headers: { "x-token": token }
            }
          );
          store._this.log.info("DeviceStatus: " + JSON.stringify(response.data));
          if (parseInt(response.data.error_code) == 0) {
            (0, import_saveValue.saveValue)("mode", power.toString(), "string");
            if (power >= 0)
              updateDeviceMode(store.device, power);
            return;
          }
          store._this.log.error("Error: " + JSON.stringify(response.data));
          store.resetOnErrorHandler();
          (0, import_saveValue.saveValue)("info.connection", false, "boolean");
        }
      } catch (error) {
        store._this.log.error(JSON.stringify(error));
        store._this.log.error(JSON.stringify(error.stack));
      }
    }
    async function updateDeviceMode(deviceCode, mode) {
      const token = store.token;
      try {
        if (token && token != "") {
          const { sURL } = (0, import_endPoints.getSUrl)();
          const response = await import_axios.default.post(
            sURL,
            (0, import_axiosParameter.getAxiosUpdateDevicePowerParams)({ deviceCode, value: mode, protocolCode: "mode" }),
            {
              headers: { "x-token": token }
            }
          );
          store._this.log.info("DeviceStatus: " + JSON.stringify(response.data));
          if (parseInt(response.data.error_code) == 0) {
            (0, import_saveValue.saveValue)("mode", mode, "string");
            return;
          }
          store._this.log.error("Error: " + JSON.stringify(response.data));
          store.resetOnErrorHandler();
          (0, import_saveValue.saveValue)("info.connection", false, "boolean");
        }
      } catch (error) {
        store._this.log.error(JSON.stringify(error));
        store._this.log.error(JSON.stringify(error.stack));
      }
    }
    async function updateDeviceSilent(deviceCode, silent) {
      try {
        const token = store.token;
        let silentMode;
        if (silent) {
          silentMode = "1";
        } else {
          silentMode = "0";
        }
        if (token && token != "") {
          const { sURL } = (0, import_endPoints.getSUrl)();
          const response = await import_axios.default.post(
            sURL,
            (0, import_axiosParameter.getAxiosUpdateDevicePowerParams)({ deviceCode, value: silentMode, protocolCode: "Manual-mute" }),
            {
              headers: { "x-token": token }
            }
          );
          store._this.log.info("DeviceStatus: " + JSON.stringify(response.data));
          if (parseInt(response.data.error_code) == 0) {
            (0, import_saveValue.saveValue)("silent", silent, "boolean");
            return;
          }
          store._this.log.error("Error: " + JSON.stringify(response.data));
          store.resetOnErrorHandler();
          (0, import_saveValue.saveValue)("info.connection", false, "boolean");
        }
      } catch (error) {
        store._this.log.error(JSON.stringify(error));
        store._this.log.error(JSON.stringify(error.stack));
      }
    }
    const updateDeviceSetTemp = async (deviceCode, temperature) => {
      try {
        const token = store.token;
        const sTemperature = temperature.toString().replace(",", ".");
        const result = await store._this.getStateAsync(dpRoot + ".mode");
        if (!result || !result.val) {
          return;
        }
        let sMode = result.val;
        if (sMode == "-1") {
          return;
        } else if (sMode == "0") {
          sMode = "R01";
        } else if (sMode == "1") {
          sMode = "R02";
        } else if (sMode == "2") {
          sMode = "R03";
        }
        if (token && token != "") {
          const { sURL } = (0, import_endPoints.getSUrl)();
          const response = await import_axios.default.post(
            sURL,
            (0, import_axiosParameter.getAxiosUpdateDeviceSetTempParams)({ deviceCode, sTemperature }),
            {
              headers: { "x-token": token }
            }
          );
          store._this.log.info("DeviceStatus: " + JSON.stringify(response.data));
          if (parseInt(response.data.error_code) == 0) {
            (0, import_saveValue.saveValue)("tempSet", temperature, "number");
            return;
          }
          store._this.log.error("Error: " + JSON.stringify(response.data));
          store.resetOnErrorHandler();
          (0, import_saveValue.saveValue)("info.connection", false, "boolean");
        }
      } catch (error) {
        store._this.log.error(JSON.stringify(error));
      }
    };
    updateIntervall = store._this.setInterval(async () => {
      try {
        await (0, import_token.updateToken)();
        const mode = await store._this.getStateAsync(dpRoot + ".mode");
        if (mode && !mode.ack && mode.val) {
          updateDevicePower(store.device, mode.val);
        }
        const silent = await this.getStateAsync(dpRoot + ".silent");
        if (silent && !silent.ack && silent.val) {
          updateDevicePower(store.device, silent.val);
        }
      } catch (error) {
        store._this.log.error(JSON.stringify(error));
        store._this.log.error(JSON.stringify(error.stack));
      }
    }, store.interval * 1e3);
    tokenRefreshTimer = setInterval(function() {
      store.token = "";
      (0, import_token.updateToken)();
    }, 36e5);
    this.on("stateChange", async (id, state) => {
      try {
        if (id === dpRoot + ".mode" && state && !state.ack) {
          (0, import_token.updateToken)();
          const mode = await this.getStateAsync(dpRoot + ".mode");
          if (mode && mode.val) {
            updateDevicePower(store.device, mode.val);
          }
        }
        if (id === dpRoot + ".silent" && state && !state.ack) {
          (0, import_token.updateToken)();
          const silent = await this.getStateAsync(dpRoot + ".silent");
          if (silent && silent.val) {
            updateDeviceSilent(store.device, silent.val);
          }
        }
        if (id === dpRoot + ".tempSet" && state && !state.ack) {
          (0, import_token.updateToken)();
          const tempSet = await this.getStateAsync(dpRoot + ".tempSet");
          if (tempSet && tempSet.val) {
            updateDeviceSetTemp(store.device, tempSet.val);
          }
        }
      } catch (error) {
        store._this.log.error(JSON.stringify(error));
        store._this.log.error(JSON.stringify(error.stack));
      }
    });
    this.subscribeStates("*");
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload(callback) {
    try {
      this.clearInterval(updateIntervall);
      clearInterval(tokenRefreshTimer);
      callback();
    } catch (e) {
      callback();
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new MidasAquatemp(options);
} else {
  (() => new MidasAquatemp())();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MidasAquatemp
});
//# sourceMappingURL=main.js.map
