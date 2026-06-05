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
var import_axiosParameter = require("./axiosParameter");
var import_utils = require("./utils");
class DeviceController {
  constructor(store, tokenManager, apiClient, apiType = null) {
    this.store = store;
    this.tokenManager = tokenManager;
    this.apiClient = apiClient;
    this.apiType = apiType;
  }
  async updateDeviceStatus() {
    var _a, _b, _c, _d, _e, _f;
    const { apiLevel, logger } = this.store;
    const res = this.getTokenAndDevice();
    if (!res) {
      return;
    }
    const payload = apiLevel < 3 ? { device_code: res.device } : { deviceCode: res.device };
    const data = await this.apiClient.request(
      this.store.getUpdateDeviceStatusSUrl(),
      payload,
      res.token
    );
    logger.debug(`DeviceStatus: ${JSON.stringify(data)}`);
    const status = apiLevel < 3 ? (_a = data.object_result) == null ? void 0 : _a.status : (_b = data.objectResult) == null ? void 0 : _b.status;
    const isReachable = status === "ONLINE";
    this.store.reachable = isReachable;
    await this.store.saveValue("info.connection", isReachable);
    if (!isReachable) {
      return;
    }
    const isFault = apiLevel < 3 ? (_c = data.object_result) == null ? void 0 : _c.is_fault : (_f = (_d = data.objectResult) == null ? void 0 : _d.is_fault) != null ? _f : (_e = data.objectResult) == null ? void 0 : _e.isFault;
    if (isFault === true) {
      await this.store.saveValue("error", true);
      await this.updateDeviceDetails();
      await this.updateDeviceErrorMsg();
      return;
    }
    await this.store.saveValue("error", false);
    await this.store.saveValue("errorMessage", "");
    await this.store.saveValue("errorCode", "");
    await this.store.saveValue("errorLevel", 0);
    await this.updateDeviceDetails();
  }
  async updateDeviceDetails() {
    var _a, _b;
    const { product, logger } = this.store;
    try {
      const token = this.tokenManager.getValidTokenOrNull();
      if (!token || !product) {
        return;
      }
      const data = await this.apiClient.request(
        this.store.getSUrlUpdateDeviceId(),
        this.getProtocolCodes(product),
        token
      );
      logger.debug(`DeviceDetails: ${JSON.stringify(data)}`);
      const responseValue = (_a = data.object_result) != null ? _a : data.objectResult;
      if (!responseValue || responseValue.length === 0) {
        return;
      }
      await this.store.saveValue("rawJSON", JSON.stringify(responseValue));
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
      await this.store.saveValue(
        "tempSet",
        (_b = tempSetValue ? parseFloat(tempSetValue) : null) != null ? _b : tempSetValueByMode ? parseFloat(tempSetValueByMode) : null
      );
      if (powerOn) {
        await this.savePowerOnSensors(responseValue, isPoolsana);
      } else {
        await this.store.saveValue("consumption", 0);
        await this.store.saveValue("rotor", 0);
      }
      await this.store.saveValue("silent", (0, import_utils.findCodeVal)(responseValue, "Manual-mute") === "1");
      await this.store.saveValue("state", powerOn);
      await this.store.saveValue("mode", powerOn && mode ? parseInt(mode) : -1);
      await this.store.saveValue("info.connection", true);
    } catch (error) {
      await this.store.resetAndHandleErrorWithSentry("Error updateDeviceDetails", error);
    }
  }
  async updateDeviceID() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
    const { logger, resetOnError } = this.store;
    try {
      const token = this.tokenManager.getValidTokenOrNull();
      if (!token) {
        return;
      }
      let data = {};
      if (!this.apiType || this.apiType === "default") {
        data = await this.apiClient.request(
          this.store.getUpdateDeviceIdSUrl(),
          this.getAxiosUpdateDeviceIdParams(),
          token
        );
      }
      logger.debug(`UpdateDeviceID response: ${JSON.stringify(data)}`);
      if (!this.isResult(data) && (!this.apiType || this.apiType === "legacy")) {
        logger.debug("No device code with standard format, retrying with legacy body wrapper...");
        data = await this.apiClient.request(
          this.store.getUpdateDeviceIdSUrl(),
          this.getAxiosUpdateDeviceIdParamsLegacy(),
          token
        );
        logger.debug(`UpdateDeviceID legacy response: ${JSON.stringify(data)}`);
        if (this.isResult(data)) {
          this.apiType = "legacy";
        }
      } else {
        this.apiType = "default";
      }
      if (!this.isResult(data)) {
        this.apiType = null;
        await this.store.resetDeviceOnly();
        logger.error(
          `No device code found in API response. Check that the device is registered under this account and the product ID is in the supported list. Response: ${JSON.stringify((_a = data == null ? void 0 : data.object_result) != null ? _a : data == null ? void 0 : data.objectResult)}`
        );
        return;
      }
      const device = (_e = (_b = data.object_result) == null ? void 0 : _b[0].device_code) != null ? _e : (_d = (_c = data.objectResult) == null ? void 0 : _c[0]) == null ? void 0 : _d.deviceCode;
      this.store.device = device;
      const product = (_k = (_j = (_g = (_f = data.object_result) == null ? void 0 : _f[0]) == null ? void 0 : _g.product_id) != null ? _j : (_i = (_h = data.objectResult) == null ? void 0 : _h[0]) == null ? void 0 : _i.productId) != null ? _k : null;
      this.store.product = product;
      const isReachable = ((_p = (_m = (_l = data.object_result) == null ? void 0 : _l[0]) == null ? void 0 : _m.device_status) != null ? _p : (_o = (_n = data.objectResult) == null ? void 0 : _n[0]) == null ? void 0 : _o.deviceStatus) == "ONLINE";
      this.store.reachable = isReachable;
      logger.debug(`device: ${device}, product: ${product}, reachable: ${isReachable}`);
      await this.store.saveValue("DeviceCode", device);
      await this.store.saveValue("ProductCode", product);
      if (!isReachable || !device) {
        logger.debug("Device not reachable");
        void resetOnError();
        return;
      }
      await this.store.saveValue("info.connection", true);
      if (device != "" && product) {
        await this.updateDeviceStatus();
      }
    } catch (error) {
      await this.store.resetAndHandleErrorWithSentry("Error in updateDeviceID", error);
    }
  }
  isResult(data) {
    var _a, _b, _c, _d;
    return !!(((_b = (_a = data == null ? void 0 : data.object_result) == null ? void 0 : _a[0]) == null ? void 0 : _b.device_code) || ((_d = (_c = data == null ? void 0 : data.objectResult) == null ? void 0 : _c[0]) == null ? void 0 : _d.deviceCode));
  }
  async updateDevicePower(mode) {
    const { logger } = this.store;
    try {
      const { powerOpt } = DeviceController.getPowerMode(mode);
      const res = this.getTokenAndDevice();
      if (!res) {
        this.store.adapter.log.warn(`Invalid values getTokenAndDevice`);
        return;
      }
      const data = await this.apiClient.request(
        this.store.getSUrl(),
        this.getAxiosUpdateDevicePowerParams(res.device, powerOpt, "Power"),
        res.token
      );
      logger.debug(`DeviceStatus: ${JSON.stringify(data)}`);
      if (mode >= 0) {
        this.store.setMode(mode);
        await this.updateDeviceMode(mode);
      } else {
        await this.store.saveValue("mode", mode);
      }
    } catch (error) {
      await this.store.resetAndHandleErrorWithSentry("Error in updateDevicePower", error);
    }
  }
  async updateDeviceSetTemp(temperature) {
    const { logger, getDpRoot, adapter } = this.store;
    try {
      const numericTemperature = typeof temperature === "number" ? temperature : parseFloat(String(temperature).replace(",", "."));
      if (!Number.isFinite(numericTemperature)) {
        logger.warn(`Invalid set temperature: ${temperature}`);
        return;
      }
      const sTemperature = numericTemperature.toString().replace(",", ".");
      const result = await adapter.getStateAsync(`${getDpRoot()}.mode`);
      if (!(result == null ? void 0 : result.val)) {
        logger.warn(`Invalid mode: ${result == null ? void 0 : result.val}`);
        return;
      }
      if (String(result == null ? void 0 : result.val) === "-1") {
        logger.debug(`Mode set to: ${result == null ? void 0 : result.val}`);
        return;
      }
      const res = this.getTokenAndDevice();
      if (!res) {
        return;
      }
      const data = await this.apiClient.request(
        this.store.getSUrl(),
        this.getAxiosUpdateDeviceSetTempParams(res.device, sTemperature),
        res.token
      );
      logger.debug(`DeviceStatus: ${JSON.stringify(data)}`);
      await this.store.saveValue("tempSet", numericTemperature);
    } catch (error) {
      await this.store.resetAndHandleErrorWithSentry("Error in updateDeviceSetTemp", error);
    }
  }
  async updateDeviceSilent(silent) {
    const { logger } = this.store;
    try {
      const silentMode = silent ? "1" : "0";
      const res = this.getTokenAndDevice();
      if (!res) {
        return;
      }
      const data = await this.apiClient.request(
        this.store.getSUrl(),
        this.getAxiosUpdateDevicePowerParams(res.device, silentMode, "Manual-mute"),
        res.token
      );
      logger.debug(`DeviceStatus: ${JSON.stringify(data)}`);
      await this.store.saveValue("silent", silent);
    } catch (error) {
      await this.store.resetAndHandleErrorWithSentry("Error in updateDeviceSilent", error);
    }
  }
  getAxiosUpdateDeviceSetTempParams(deviceCode, sTemperature) {
    return {
      param: ["R01", "R02", "R03", "Set_Temp"].map((code) => this.controlParam(deviceCode, code, sTemperature))
    };
  }
  getAxiosUpdateDeviceIdParams() {
    return this.store.apiLevel < 3 ? { product_ids: import_axiosParameter.PRODUCT_IDS } : { productIds: import_axiosParameter.PRODUCT_IDS };
  }
  getAxiosUpdateDeviceIdParamsLegacy() {
    return { body: { productIds: import_axiosParameter.PRODUCT_IDS } };
  }
  getProtocolCodes(productId) {
    const codes = productId === import_store.Store.AQUATEMP_POOLSANA ? import_axiosParameter.CODES_POOLSANA : import_axiosParameter.CODES_OTHER;
    return this.store.apiLevel < 3 ? { device_code: this.store.device, protocal_codes: codes } : { deviceCode: this.store.device, protocalCodes: codes };
  }
  getAxiosUpdateDevicePowerParams(deviceCode, value, protocolCode) {
    return {
      param: [this.controlParam(deviceCode, protocolCode, value)]
    };
  }
  controlParam = (deviceCode, protocolCode, value) => {
    return this.store.apiLevel < 3 ? { device_code: deviceCode, protocol_code: protocolCode, value } : { deviceCode, protocolCode, value };
  };
  async savePowerOnSensors(responseValue, isPoolsana) {
    const sensorCodes = DeviceController.getSensorCodes(isPoolsana);
    const powerVal = (0, import_utils.parseFloatOrNull)((0, import_utils.findCodeVal)(responseValue, sensorCodes.tPower));
    const tVoltageVal = (0, import_utils.parseFloatOrNull)((0, import_utils.findCodeVal)(responseValue, sensorCodes.tVoltage));
    const consumptionValue = (0, import_utils.isDefined)(powerVal) && (0, import_utils.isDefined)(tVoltageVal) ? powerVal * tVoltageVal : 0;
    await this.store.saveValue("consumption", consumptionValue);
    const flowSwitchValue = (0, import_utils.findCodeVal)(responseValue, sensorCodes.flowSwitch);
    await this.saveSensorNumber("suctionTemp", responseValue, sensorCodes.tSuction);
    await this.saveSensorNumber("tempIn", responseValue, sensorCodes.tIn);
    await this.saveSensorNumber("tempOut", responseValue, sensorCodes.tOut);
    await this.saveSensorNumber("coilTemp", responseValue, sensorCodes.tCoil);
    await this.saveSensorNumber("ambient", responseValue, sensorCodes.tAmb);
    await this.saveNumberIfValid("voltage", tVoltageVal);
    await this.store.saveValue(
      "flowSwitch",
      flowSwitchValue ? [1, "1", "true", true].includes(flowSwitchValue) : null
    );
    await this.saveSensorNumber("rotor", responseValue, sensorCodes.tRotor, true);
  }
  async saveSensorNumber(key, res, code, int) {
    const val = (0, import_utils.findCodeVal)(res, code);
    await this.saveNumberIfValid(key, int ? (0, import_utils.parseIntOrNull)(val) : (0, import_utils.parseFloatOrNull)(val));
  }
  async updateDeviceErrorMsg() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
    const { apiLevel, cloudURL, saveValue } = this.store;
    try {
      const res = this.getTokenAndDevice();
      if (!res) {
        return;
      }
      const sURL = apiLevel < 3 ? `${cloudURL}/app/device/getFaultDataByDeviceCode.json` : `${cloudURL}/app/device/getFaultDataByDeviceCode`;
      const data = await this.apiClient.request(
        sURL,
        {
          device_code: res.device,
          deviceCode: res.device
        },
        res.token
      );
      await saveValue("error", true);
      await saveValue(
        "errorMessage",
        (_f = (_e = (_b = (_a = data.objectResult) == null ? void 0 : _a[0]) == null ? void 0 : _b.description) != null ? _e : (_d = (_c = data.object_result) == null ? void 0 : _c[0]) == null ? void 0 : _d.description) != null ? _f : ""
      );
      await saveValue("errorCode", (_k = (_h = (_g = data.objectResult) == null ? void 0 : _g[0]) == null ? void 0 : _h.faultCode) != null ? _k : (_j = (_i = data.object_result) == null ? void 0 : _i[0]) == null ? void 0 : _j.fault_code);
      await saveValue("errorLevel", (_p = (_m = (_l = data.objectResult) == null ? void 0 : _l[0]) == null ? void 0 : _m.errorLevel) != null ? _p : (_o = (_n = data.object_result) == null ? void 0 : _n[0]) == null ? void 0 : _o.error_level);
    } catch (error) {
      await this.store.resetAndHandleErrorWithSentry("Error in updateDeviceErrorMsg", error);
    }
  }
  async updateDeviceMode(mode) {
    const { logger, saveValue } = this.store;
    const res = this.getTokenAndDevice();
    if (!res) {
      return;
    }
    const data = await this.apiClient.request(
      this.store.getSUrl(),
      this.getAxiosUpdateDevicePowerParams(res.device, mode, "Mode"),
      res.token
    );
    logger.debug(`DeviceStatus: ${JSON.stringify(data)}`);
    await saveValue("mode", mode);
  }
  static getSensorCodes(isPoolsana) {
    return {
      tPower: isPoolsana ? "T07" : "T7",
      tSuction: isPoolsana ? "T01" : "T1",
      tIn: isPoolsana ? "T02" : "T2",
      tOut: isPoolsana ? "T03" : "T3",
      tCoil: isPoolsana ? "T04" : "T4",
      tAmb: isPoolsana ? "T05" : "T5",
      flowSwitch: isPoolsana ? "S03" : "S3",
      tVoltage: "T14",
      tRotor: "T17"
    };
  }
  getTokenAndDevice() {
    const token = this.tokenManager.getValidTokenOrNull();
    const device = this.store.device;
    if (!token || !device) {
      return null;
    }
    return { token, device };
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
        return { powerOpt: 0, powerMode: -1 };
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DeviceController
});
//# sourceMappingURL=deviceController.js.map
