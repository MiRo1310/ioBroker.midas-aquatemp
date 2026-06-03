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
var deviceController_exports = {};
__export(deviceController_exports, {
  DeviceController: () => DeviceController
});
module.exports = __toCommonJS(deviceController_exports);
var import_store = require("./store");
var import_endPoints = require("./endPoints");
var import_axios = require("./axios");
var import_axiosParameter = require("./axiosParameter");
var import_utils = require("./utils");
var import_logging = require("./logging");
class DeviceController {
  constructor(store, tokenManager) {
    this.store = store;
    this.tokenManager = tokenManager;
  }
  async updateDeviceStatus() {
    var _a, _b, _c, _d, _e, _f;
    const { device: deviceCode, apiLevel, adapter, saveValue, resetOnErrorHandler } = this.store;
    try {
      const token = this.tokenManager.getValidTokenOrNull();
      if (!token || !deviceCode) {
        return;
      }
      const { sURL } = (0, import_endPoints.getUpdateDeviceStatusSUrl)(this.store);
      const payload = apiLevel < 3 ? { device_code: deviceCode } : { deviceCode };
      const { data, error } = await (0, import_axios.request)(adapter, sURL, payload, (0, import_axiosParameter.getHeaders)(token));
      if (!data || error) {
        await this.store.resetOnErrorHandler();
        return;
      }
      adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);
      const status = apiLevel < 3 ? (_a = data.object_result) == null ? void 0 : _a.status : (_b = data.objectResult) == null ? void 0 : _b.status;
      const isReachable = status === "ONLINE";
      this.store.reachable = isReachable;
      await saveValue("info.connection", isReachable);
      if (!isReachable) {
        return;
      }
      const isFault = apiLevel < 3 ? (_c = data.object_result) == null ? void 0 : _c.is_fault : (_f = (_d = data.objectResult) == null ? void 0 : _d.is_fault) != null ? _f : (_e = data.objectResult) == null ? void 0 : _e.isFault;
      if (isFault === true) {
        await saveValue("error", true);
        await this.updateDeviceDetails();
        await this.updateDeviceErrorMsg();
        return;
      }
      await saveValue("error", false);
      await saveValue("errorMessage", "");
      await saveValue("errorCode", "");
      await saveValue("errorLevel", 0);
      await this.updateDeviceDetails();
    } catch (error) {
      await resetOnErrorHandler();
      (0, import_logging.errorLogger)("Error in updateDeviceStatus", error, adapter);
    }
  }
  async updateDeviceDetails() {
    var _a, _b;
    const { device: deviceCode, product, resetOnErrorHandler, saveValue, adapter } = this.store;
    try {
      const token = this.tokenManager.getValidTokenOrNull();
      if (!token || !deviceCode || !product) {
        return;
      }
      const { sURL } = (0, import_endPoints.getSUrlUpdateDeviceId)(this.store);
      const { data, error } = await (0, import_axios.request)(
        adapter,
        sURL,
        (0, import_axiosParameter.getProtocolCodes)(this.store, product),
        (0, import_axiosParameter.getHeaders)(token)
      );
      if (!data || error) {
        await resetOnErrorHandler();
        return;
      }
      adapter.log.debug(`DeviceDetails: ${JSON.stringify(data)}`);
      const responseValue = (_a = data.object_result) != null ? _a : data.objectResult;
      if (!responseValue || responseValue.length === 0) {
        return;
      }
      await saveValue("rawJSON", JSON.stringify(responseValue));
      const isPoolsana = product === import_store.Store.AQUATEMP_POOLSANA;
      const powerOn = (0, import_utils.findCodeVal)(responseValue, "Power") === "1";
      const mode = (0, import_utils.findCodeVal)(responseValue, "Mode");
      const modes = {
        1: "R02",
        // Heiz-Modus (-> R02)
        0: "R01",
        // Kühl-Modus (-> R01)
        2: "R03"
        // Auto-Modus (-> R03)
      };
      const tempSetValue = (0, import_utils.findCodeVal)(responseValue, "Set_Temp");
      const tempSetValueByMode = mode ? (0, import_utils.findCodeVal)(responseValue, modes[parseInt(mode)]) : null;
      await saveValue(
        "tempSet",
        (_b = tempSetValue ? parseFloat(tempSetValue) : null) != null ? _b : tempSetValueByMode ? parseFloat(tempSetValueByMode) : null
      );
      if (powerOn) {
        const tPower = isPoolsana ? "T07" : "T7";
        const tVoltage = "T14";
        const tSuction = isPoolsana ? "T01" : "T1";
        const tIn = isPoolsana ? "T02" : "T2";
        const tOut = isPoolsana ? "T03" : "T3";
        const tCoil = isPoolsana ? "T04" : "T4";
        const tAmb = isPoolsana ? "T05" : "T5";
        const flowSwitch = isPoolsana ? "S03" : "S3";
        const tRotor = "T17";
        const powerVal = (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tPower));
        const tVoltageVal = (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tVoltage));
        const consumptionValue = (0, import_utils.isDefined)(powerVal) && (0, import_utils.isDefined)(tVoltageVal) ? powerVal * tVoltageVal : 0;
        await saveValue("consumption", consumptionValue);
        const flowSwitchValue = (0, import_utils.findCodeVal)(responseValue, flowSwitch);
        await this.saveNumberIfValid("suctionTemp", (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tSuction)));
        await this.saveNumberIfValid("tempIn", (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tIn)));
        await this.saveNumberIfValid("tempOut", (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tOut)));
        await this.saveNumberIfValid("coilTemp", (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tCoil)));
        await this.saveNumberIfValid("ambient", (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tAmb)));
        await this.saveNumberIfValid("voltage", tVoltageVal);
        await saveValue(
          "flowSwitch",
          flowSwitchValue ? [1, "1", "true", true].includes(flowSwitchValue) : null
        );
        await this.saveNumberIfValid("rotor", (0, import_utils.parseIntOrNull)((0, import_utils.findCodeVal)(responseValue, tRotor)));
      } else {
        await saveValue("consumption", 0);
        await saveValue("rotor", 0);
      }
      await saveValue("silent", (0, import_utils.findCodeVal)(responseValue, "Manual-mute") === "1");
      await saveValue("state", powerOn);
      await saveValue("mode", powerOn && mode ? parseInt(mode) : -1);
      await saveValue("info.connection", true);
    } catch (error) {
      (0, import_logging.errorLogger)("Error updateDeviceDetails", error, adapter);
      void resetOnErrorHandler();
    }
  }
  async updateDeviceID() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
    const { adapter, resetOnErrorHandler, saveValue } = this.store;
    try {
      const token = this.tokenManager.getValidTokenOrNull();
      if (!token) {
        return;
      }
      const { data, status, error } = await (0, import_axios.request)(
        adapter,
        (0, import_endPoints.getUpdateDeviceIdSUrl)(this.store).sURL,
        (0, import_axiosParameter.getAxiosUpdateDeviceIdParams)(this.store),
        (0, import_axiosParameter.getHeaders)(token)
      );
      adapter.log.debug(`UpdateDeviceID response: ${JSON.stringify(data)}, status: ${status}`);
      if (!data || error) {
        await resetOnErrorHandler();
        return;
      }
      if (!((_b = (_a = data == null ? void 0 : data.object_result) == null ? void 0 : _a[0]) == null ? void 0 : _b.device_code) && !((_d = (_c = data == null ? void 0 : data.objectResult) == null ? void 0 : _c[0]) == null ? void 0 : _d.deviceCode)) {
        await resetOnErrorHandler();
        adapter.log.error(
          "No device code found. Maybe the token is not valid. Please check if there are not two usages of the same account. In the next loop the token will be refreshed."
        );
        return;
      }
      const device = (_h = (_e = data.object_result) == null ? void 0 : _e[0].device_code) != null ? _h : (_g = (_f = data.objectResult) == null ? void 0 : _f[0]) == null ? void 0 : _g.deviceCode;
      this.store.device = device;
      const product = (_n = (_m = (_j = (_i = data.object_result) == null ? void 0 : _i[0]) == null ? void 0 : _j.product_id) != null ? _m : (_l = (_k = data.objectResult) == null ? void 0 : _k[0]) == null ? void 0 : _l.productId) != null ? _n : null;
      this.store.product = product;
      const isReachable = ((_s = (_p = (_o = data.object_result) == null ? void 0 : _o[0]) == null ? void 0 : _p.device_status) != null ? _s : (_r = (_q = data.objectResult) == null ? void 0 : _q[0]) == null ? void 0 : _r.deviceStatus) == "ONLINE";
      this.store.reachable = isReachable;
      adapter.log.debug(`device: ${device}, product: ${product}, reachable: ${isReachable}`);
      await saveValue("DeviceCode", device);
      await saveValue("ProductCode", product);
      if (!isReachable || !device) {
        adapter.log.debug("Device not reachable");
        void resetOnErrorHandler();
        return;
      }
      await saveValue("info.connection", true);
      if (device != "" && product) {
        await this.updateDeviceStatus();
      }
    } catch (error) {
      (0, import_logging.errorLogger)("Error in updateDeviceID", error, adapter);
      await resetOnErrorHandler();
    }
  }
  async updateDevicePower(mode) {
    const { adapter, device, resetOnErrorHandler, setMode, saveValue } = this.store;
    try {
      const { powerMode, powerOpt } = DeviceController.getPowerMode(mode);
      const token = this.tokenManager.getValidTokenOrNull();
      if (!(0, import_utils.isDefined)(powerOpt) || !(0, import_utils.isDefined)(powerMode) || !token || !device) {
        this.store.adapter.log.warn(`Invalid value(s) : ${mode}, ${token}, ${device}`);
        return;
      }
      const { sURL } = (0, import_endPoints.getSUrl)(this.store);
      const { data, error } = await (0, import_axios.request)(
        adapter,
        sURL,
        (0, import_axiosParameter.getAxiosUpdateDevicePowerParams)(this.store, device, powerOpt, "Power"),
        (0, import_axiosParameter.getHeaders)(token)
      );
      if (!data || error) {
        await resetOnErrorHandler();
        return;
      }
      adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);
      if (mode >= 0) {
        setMode(mode);
        await this.updateDeviceMode(mode);
      } else {
        await saveValue("mode", mode);
      }
    } catch (error) {
      (0, import_logging.errorLogger)("Error in updateDevicePower", error, adapter);
    }
  }
  async updateDeviceSetTemp(temperature) {
    const { adapter, device, getDpRoot, resetOnErrorHandler, saveValue } = this.store;
    try {
      const numericTemperature = typeof temperature === "number" ? temperature : parseFloat(String(temperature).replace(",", "."));
      if (!Number.isFinite(numericTemperature)) {
        adapter.log.warn(`Invalid set temperature: ${temperature}`);
        return;
      }
      const sTemperature = numericTemperature.toString().replace(",", ".");
      const result = await adapter.getStateAsync(`${getDpRoot()}.mode`);
      if (!(result == null ? void 0 : result.val)) {
        adapter.log.warn(`Invalid mode: ${result == null ? void 0 : result.val}`);
        return;
      }
      if (String(result == null ? void 0 : result.val) === "-1") {
        adapter.log.debug(`Mode set to: ${result == null ? void 0 : result.val}`);
        return;
      }
      const token = this.tokenManager.getValidTokenOrNull();
      if (token && device) {
        const { sURL } = (0, import_endPoints.getSUrl)(this.store);
        const { data, error } = await (0, import_axios.request)(
          adapter,
          sURL,
          (0, import_axiosParameter.getAxiosUpdateDeviceSetTempParams)(device, sTemperature, this.store),
          (0, import_axiosParameter.getHeaders)(token)
        );
        adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);
        if (error) {
          await resetOnErrorHandler();
          return;
        }
        await saveValue("tempSet", numericTemperature);
      }
    } catch (error) {
      (0, import_logging.errorLogger)("Error in updateDeviceSetTemp", error, adapter);
    }
  }
  async updateDeviceSilent(silent) {
    const { adapter, device, resetOnErrorHandler, saveValue } = this.store;
    try {
      const silentMode = silent ? "1" : "0";
      const token = this.tokenManager.getValidTokenOrNull();
      if (token && device) {
        const { data, error } = await (0, import_axios.request)(
          adapter,
          (0, import_endPoints.getSUrl)(this.store).sURL,
          (0, import_axiosParameter.getAxiosUpdateDevicePowerParams)(this.store, device, silentMode, "Manual-mute"),
          (0, import_axiosParameter.getHeaders)(token)
        );
        if (!data || error) {
          await resetOnErrorHandler();
          return;
        }
        adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);
        await saveValue("silent", silent);
      }
    } catch (error) {
      (0, import_logging.errorLogger)("Error in updateDeviceSilent", error, adapter);
    }
  }
  async updateDeviceErrorMsg() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
    const { adapter, apiLevel, cloudURL, device: deviceCode, resetOnErrorHandler, saveValue } = this.store;
    try {
      const token = this.tokenManager.getValidTokenOrNull();
      if (!token) {
        return;
      }
      const sURL = apiLevel < 3 ? `${cloudURL}/app/device/getFaultDataByDeviceCode.json` : `${cloudURL}/app/device/getFaultDataByDeviceCode`;
      const { data, error } = await (0, import_axios.request)(
        adapter,
        sURL,
        {
          device_code: deviceCode,
          deviceCode
        },
        (0, import_axiosParameter.getHeaders)(token)
      );
      if (!data || error) {
        await resetOnErrorHandler();
        return;
      }
      await saveValue("error", true);
      await saveValue(
        "errorMessage",
        (_f = (_e = (_b = (_a = data.objectResult) == null ? void 0 : _a[0]) == null ? void 0 : _b.description) != null ? _e : (_d = (_c = data.object_result) == null ? void 0 : _c[0]) == null ? void 0 : _d.description) != null ? _f : ""
      );
      await saveValue("errorCode", (_k = (_h = (_g = data.objectResult) == null ? void 0 : _g[0]) == null ? void 0 : _h.faultCode) != null ? _k : (_j = (_i = data.object_result) == null ? void 0 : _i[0]) == null ? void 0 : _j.fault_code);
      await saveValue("errorLevel", (_p = (_m = (_l = data.objectResult) == null ? void 0 : _l[0]) == null ? void 0 : _m.errorLevel) != null ? _p : (_o = (_n = data.object_result) == null ? void 0 : _n[0]) == null ? void 0 : _o.error_level);
    } catch (error) {
      (0, import_logging.errorLogger)("Error in updateDeviceErrorMsg", error, adapter);
    }
  }
  async updateDeviceMode(mode) {
    const { adapter, device, resetOnErrorHandler, saveValue } = this.store;
    try {
      const token = this.tokenManager.getValidTokenOrNull();
      if (token && device) {
        const { sURL } = (0, import_endPoints.getSUrl)(this.store);
        const { data, error } = await (0, import_axios.request)(
          adapter,
          sURL,
          (0, import_axiosParameter.getAxiosUpdateDevicePowerParams)(this.store, device, mode, "Mode"),
          {
            headers: { "x-token": token }
          }
        );
        if (!data || error) {
          await resetOnErrorHandler();
          return;
        }
        adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);
        await saveValue("mode", mode);
      }
    } catch (error) {
      (0, import_logging.errorLogger)("Error in updateDeviceMode", error, adapter);
    }
  }
  async saveNumberIfValid(key, value) {
    if (!Number.isFinite(value)) {
      return false;
    }
    await this.store.saveValue(key, value);
    return true;
  }
  static getPowerMode(mode) {
    switch (mode) {
      case -1:
        return {
          powerOpt: 0,
          powerMode: -1
        };
      case 0:
        return {
          powerOpt: 1,
          powerMode: 0
        };
      case 1:
        return {
          powerOpt: 1,
          powerMode: 1
        };
      case 2:
        return {
          powerOpt: 1,
          powerMode: 2
        };
      default:
        return { powerOpt: null, powerMode: null };
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DeviceController
});
//# sourceMappingURL=deviceController.js.map
