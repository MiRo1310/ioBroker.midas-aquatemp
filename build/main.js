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
var utils = __toESM(require("@iobroker/adapter-core"));
var import_axios = __toESM(require("axios"));
var import_createState = require("./lib/createState");
var import_encryptPassword = require("./lib/encryptPassword");
var import_endPoints = require("./lib/endPoints");
var import_saveValue = require("./lib/saveValue");
var import_store = require("./lib/store");
var import_token = require("./lib/token");
const store = (0, import_store.useStore)();
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
    const cloudURL = store.cloudURL;
    const encryptedPassword = store.encryptedPassword;
    await (0, import_token.updateToken)();
    function clearValues() {
      (0, import_saveValue.saveValue)("error", true, "boolean");
      (0, import_saveValue.saveValue)("consumption", 0, "number");
      (0, import_saveValue.saveValue)("state", false, "boolean");
      (0, import_saveValue.saveValue)("rawJSON", null, "string");
    }
    function updateDevicePower(deviceCode, power) {
      const token = store.token;
      var powerOpt;
      var powerMode = 2;
      if (power == -1) {
        powerOpt = 0;
        powerMode = -1;
      } else if (power == 0) {
        powerOpt = 1;
        powerMode = 0;
      } else if (power == 1) {
        powerOpt = 1;
        powerMode = 1;
      } else if (power == 2) {
        powerOpt = 1;
        powerMode = 2;
      } else {
        return;
      }
      if (token != "") {
        var sURL = "";
        if (store.apiLevel < 3) {
          sURL = cloudURL + "/app/device/control.json";
        } else {
          sURL = cloudURL + "/app/device/control";
        }
        import_axios.default.post(sURL, {
          "param": [{
            "device_code": deviceCode,
            "deviceCode": deviceCode,
            "protocol_code": "Power",
            "protocolCode": "Power",
            "value": powerOpt
          }]
        }, {
          headers: { "x-token": token }
        }).then(function(response) {
          if (parseInt(response.data.error_code) == 0) {
            (0, import_saveValue.saveValue)("mode", power.toString(), "string");
            if (power >= 0)
              updateDeviceMode(store.device, power);
          } else {
            store.resetOnErrorHandler();
          }
        }).catch(function(error) {
          store.resetOnErrorHandler();
        });
      }
    }
    function updateDeviceMode(devicecode, mode) {
      const token = store.token;
      if (token != "") {
        var sURL = "";
        if (store.apiLevel < 3) {
          sURL = cloudURL + "/app/device/control.json";
        } else {
          sURL = cloudURL + "/app/device/control";
        }
        import_axios.default.post(sURL, {
          "param": [{
            "device_code": devicecode,
            "deviceCode": devicecode,
            "protocol_code": "mode",
            "protocolCode": "mode",
            "value": mode
          }]
        }, {
          headers: { "x-token": token }
        }).then(function(response) {
          if (parseInt(response.data.error_code) == 0) {
            (0, import_saveValue.saveValue)("mode", mode, "string");
            return;
          }
          store.resetOnErrorHandler();
        }).catch(function(error) {
          store.resetOnErrorHandler();
        });
      }
    }
    function updateDeviceSilent(deviceCode, silent) {
      const token = store.token;
      var silentMode;
      if (silent) {
        silentMode = "1";
      } else {
        silentMode = "0";
      }
      if (token != "") {
        var sURL = "";
        if (store.apiLevel < 3) {
          sURL = cloudURL + "/app/device/control.json";
        } else {
          sURL = cloudURL + "/app/device/control";
        }
        import_axios.default.post(sURL, {
          "param": [{
            "device_code": deviceCode,
            "deviceCode": deviceCode,
            "protocol_code": "Manual-mute",
            "protocolCode": "Manual-mute",
            "value": silentMode
          }]
        }, {
          headers: { "x-token": token }
        }).then(function(response) {
          if (parseInt(response.data.error_code) == 0) {
            (0, import_saveValue.saveValue)("silent", silent, "boolean");
          } else {
            store.resetOnErrorHandler();
          }
        }).catch(function(error) {
          store.resetOnErrorHandler();
        });
      }
    }
    const updateDeviceSetTemp = async (deviceCode, temperature) => {
      try {
        const token = store.token;
        var sTemperature = temperature.toString().replace(",", ".");
        const result = await this.getStateAsync(dpRoot + ".mode");
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
        if (token != "") {
          var sURL = "";
          if (store.apiLevel < 3) {
            sURL = cloudURL + "/app/device/control.json";
          } else {
            sURL = cloudURL + "/app/device/control";
          }
          const response = await import_axios.default.post(sURL, {
            "param": [
              {
                "device_code": deviceCode,
                "deviceCode": deviceCode,
                "protocol_code": "R01",
                "protocolCode": "R01",
                "value": sTemperature
              },
              {
                "device_code": deviceCode,
                "deviceCode": deviceCode,
                "protocol_code": "R02",
                "protocolCode": "R02",
                "value": sTemperature
              },
              {
                "device_code": deviceCode,
                "deviceCode": deviceCode,
                "protocol_code": "R03",
                "protocolCode": "R03",
                "value": sTemperature
              },
              {
                "device_code": deviceCode,
                "deviceCode": deviceCode,
                "protocol_code": "Set_Temp",
                "protocolCode": "Set_Temp",
                "value": sTemperature
              }
            ]
          }, {
            headers: { "x-token": token }
          });
          if (parseInt(response.data.error_code) == 0) {
            (0, import_saveValue.saveValue)("tempSet", temperature, "number");
          } else {
            store.resetOnErrorHandler();
          }
        }
      } catch (error) {
        this.log.error(JSON.stringify(error));
      }
    };
    updateIntervall = this.setInterval(async () => {
      await (0, import_token.updateToken)();
      const mode = await this.getStateAsync(dpRoot + ".mode");
      if (mode && !mode.ack && mode.val) {
        updateDevicePower(store.device, mode.val);
      }
      const silent = await this.getStateAsync(dpRoot + ".silent");
      if (silent && !silent.ack && silent.val) {
        updateDevicePower(store.device, silent.val);
      }
    }, store.interval * 1e3);
    tokenRefreshTimer = setInterval(function() {
      store.token = "";
      (0, import_token.updateToken)();
    }, 36e5);
    this.on("stateChange", async (id, state) => {
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
          updateDevicePower(store.device, silent.val);
        }
      }
      if (id === dpRoot + ".tempSet" && state && !state.ack) {
        (0, import_token.updateToken)();
        const tempSet = await this.getStateAsync(dpRoot + ".tempSet");
        if (tempSet && tempSet.val) {
          updateDeviceSetTemp(store.device, tempSet.val);
        }
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
