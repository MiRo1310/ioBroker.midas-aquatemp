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
var import_axiosParameter = require("./axiosParameter");
var import_utils = require("./utils");
var import_apiClient = require("./apiClient");
class DeviceController {
  constructor(store, tokenManager, apiClient, apiType = null) {
    this.store = store;
    this.tokenManager = tokenManager;
    this.apiClient = apiClient;
    this.apiType = apiType;
  }
  async updateDeviceStatus() {
    const res = this.getTokenAndDevice();
    if (!res) {
      return;
    }
    const payload = this.isApiLevelLessThan3() ? { device_code: res.device } : { deviceCode: res.device };
    const data = await this.apiClient.request(
      this.store.getUpdateDeviceStatusSUrl(),
      payload,
      res.token
    );
    this.store.logger.debug(`Device status response: ${JSON.stringify(data)}`);
    const isOnline = this.isOnline(data);
    this.store.isOnline = isOnline;
    await this.store.saveValue("info.connection", isOnline);
    await this.store.saveValue("online", isOnline);
    if (!isOnline) {
      this.store.logger.warn("Device is offline");
      return;
    }
    if (this.isFault(data)) {
      this.store.logger.warn("Device fault detected, fetching error details");
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
  isApiLevelLessThan3() {
    return this.store.apiLevel < 3;
  }
  isOnline(data) {
    var _a, _b;
    return (this.isApiLevelLessThan3() ? (_a = data.object_result) == null ? void 0 : _a.status : (_b = data.objectResult) == null ? void 0 : _b.status) === "ONLINE";
  }
  isFault(data) {
    var _a, _b, _c, _d;
    return !!(this.isApiLevelLessThan3() ? (_a = data.object_result) == null ? void 0 : _a.is_fault : (_d = (_b = data.objectResult) == null ? void 0 : _b.is_fault) != null ? _d : (_c = data.objectResult) == null ? void 0 : _c.isFault);
  }
  async updateDeviceDetails() {
    var _a, _b, _c;
    const { product, logger } = this.store;
    const token = this.tokenManager.getValidTokenOrNull();
    if (!token || !product) {
      return;
    }
    try {
      const data = await this.apiClient.request(
        this.store.getSUrlUpdateDeviceId(),
        this.getProtocolCodes(),
        token
      );
      logger.debug(`Device details response: ${JSON.stringify(data)}`);
      const responseValue = (_a = data.object_result) != null ? _a : data.objectResult;
      if (!responseValue || responseValue.length === 0) {
        return;
      }
      await this.store.saveValue("rawJSON", JSON.stringify(responseValue));
      const powerOn = (0, import_utils.findCodeVal)(responseValue, "Power") === "1";
      const mode = (0, import_utils.findCodeVal)(responseValue, "Mode");
      const modes = {
        0: "R01",
        // Kühl-Modus (-> R01)
        1: "R02",
        // Heiz-Modus (-> R02)
        2: "R03"
        // Auto-Modus (-> R03)
      };
      const tempSetValue = (0, import_utils.findCodeVal)(responseValue, "Set_Temp");
      const tempSetValueByMode = mode ? (0, import_utils.findCodeVal)(responseValue, modes[parseInt(mode)]) : null;
      await this.store.saveValue(
        "tempSet",
        (_c = (_b = this.getTempSetOverride(product, responseValue)) != null ? _b : tempSetValueByMode ? parseFloat(tempSetValueByMode) : null) != null ? _c : tempSetValue ? parseFloat(tempSetValue) : null
      );
      await this.saveSensors(responseValue);
      await this.store.saveValue("silent", (0, import_utils.findCodeVal)(responseValue, "Manual-mute") === "1");
      await this.store.saveValue("state", powerOn);
      await this.store.saveValue("mode", powerOn && mode ? parseInt(mode) : -1);
      await this.store.saveValue("info.connection", true);
      await this.store.saveValue("online", true);
    } catch (error) {
      throw new import_apiClient.ResetError("Error updateDeviceDetails", {
        cause: error,
        sendToSentry: !(error instanceof import_apiClient.ApiError)
      });
    }
  }
  getTempSetOverride(product, responseValue) {
    if (product === "1650758828508766208") {
      return (0, import_utils.parseFloatOrNull)((0, import_utils.findCodeVal)(responseValue, "R01"));
    }
    return void 0;
  }
  async fetchDevice() {
    var _a, _b;
    const { logger } = this.store;
    const token = this.tokenManager.getValidTokenOrNull();
    if (!token) {
      return;
    }
    try {
      let data = {};
      if (!this.apiType || this.apiType === "default") {
        data = await this.apiClient.request(
          this.store.getUpdateDeviceIdSUrl(),
          this.getAxiosUpdateDeviceIdParams(),
          token
        );
      }
      logger.debug(`Device list response: ${JSON.stringify(data)}`);
      let deviceCode = this.getDeviceCode(data);
      if (!deviceCode && (!this.apiType || this.apiType === "legacy")) {
        logger.debug("No device found with default format, retrying with legacy format...");
        data = await this.apiClient.request(
          this.store.getUpdateDeviceIdSUrl(),
          this.getAxiosUpdateDeviceIdParamsLegacy(),
          token
        );
        logger.debug(`Device list legacy response: ${JSON.stringify(data)}`);
        if (this.getDeviceCode(data)) {
          this.apiType = "legacy";
        }
      } else {
        this.apiType = "default";
      }
      deviceCode = this.getDeviceCode(data);
      if (!deviceCode) {
        this.apiType = null;
        await this.store.resetDeviceOnly();
        logger.error(
          `No device code found in API response. Check that the device is registered under this account and the product ID is in the supported list. Response: ${JSON.stringify((_a = data == null ? void 0 : data.object_result) != null ? _a : data == null ? void 0 : data.objectResult)}`
        );
        return;
      }
      this.store.device = deviceCode;
      const productId = this.getProductId(data);
      this.store.product = productId;
      const isOnline = this.isDeviceStatusOnline(data);
      this.store.isOnline = isOnline;
      logger.info(`Device found: ${deviceCode} (product: ${productId}, online: ${isOnline})`);
      await this.store.saveValue("DeviceCode", deviceCode);
      await this.store.saveValue("ProductCode", productId);
      if (!isOnline) {
        logger.warn("Device is offline");
        await this.store.resetOnError();
        return;
      }
      await this.store.saveValue("info.connection", true);
      await this.store.saveValue("online", true);
      if (deviceCode != "" && productId) {
        await this.updateDeviceStatus();
      }
    } catch (error) {
      if (error instanceof import_apiClient.ResetError) {
        throw error;
      }
      throw new import_apiClient.ResetError(
        `fetchDevice failed (possible account conflict \u2014 check if the account is used elsewhere): ${(_b = error == null ? void 0 : error.message) != null ? _b : String(error)}`,
        { cause: error, sendToSentry: !(error instanceof import_apiClient.ApiError) }
      );
    }
  }
  getProductId(data) {
    var _a, _b, _c, _d, _e;
    return (_e = (_b = (_a = data.object_result) == null ? void 0 : _a[0]) == null ? void 0 : _b.product_id) != null ? _e : (_d = (_c = data.objectResult) == null ? void 0 : _c[0]) == null ? void 0 : _d.productId;
  }
  getDeviceCode(data) {
    var _a, _b, _c, _d;
    return ((_b = (_a = data == null ? void 0 : data.object_result) == null ? void 0 : _a[0]) == null ? void 0 : _b.device_code) || ((_d = (_c = data == null ? void 0 : data.objectResult) == null ? void 0 : _c[0]) == null ? void 0 : _d.deviceCode);
  }
  isDeviceStatusOnline(data) {
    var _a, _b, _c, _d, _e;
    return ((_e = (_b = (_a = data.object_result) == null ? void 0 : _a[0]) == null ? void 0 : _b.device_status) != null ? _e : (_d = (_c = data.objectResult) == null ? void 0 : _c[0]) == null ? void 0 : _d.deviceStatus) === "ONLINE";
  }
  async updateDevicePower(mode) {
    const { logger } = this.store;
    const { powerOpt } = DeviceController.getPowerMode(mode);
    const res = this.getTokenAndDevice();
    if (!res) {
      logger.warn("Cannot send power command: no valid token or device available");
      return;
    }
    const data = await this.apiClient.request(
      this.store.getSUrl(),
      this.getAxiosUpdateDevicePowerParams(res.device, powerOpt, "Power"),
      res.token
    );
    logger.debug(`Power command response: ${JSON.stringify(data)}`);
    logger.info(`Power set to: ${mode === -1 ? "OFF" : `ON (mode: ${mode})`}`);
    if (mode >= 0) {
      this.store.setMode(mode);
      await this.updateDeviceMode(mode);
    } else {
      await this.store.saveValue("mode", mode);
    }
  }
  async updateDeviceSetTemp(temperature) {
    const { logger, adapter } = this.store;
    const numericTemperature = typeof temperature === "number" ? temperature : parseFloat(String(temperature).replace(",", "."));
    if (!Number.isFinite(numericTemperature)) {
      logger.warn(`Invalid set temperature: ${temperature}`);
      return;
    }
    const sTemperature = numericTemperature.toString().replace(",", ".");
    const result = await adapter.getStateAsync(this.store.getStateIdByKey("mode"));
    if (!(result == null ? void 0 : result.val)) {
      logger.warn(`Skipping temperature update: current mode is invalid (${result == null ? void 0 : result.val})`);
      return;
    }
    if (String(result == null ? void 0 : result.val) === "-1") {
      logger.debug("Skipping temperature update: device is off (mode -1)");
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
    logger.debug(`Temperature command response: ${JSON.stringify(data)}`);
    logger.info(`Temperature set to: ${numericTemperature}\xB0C`);
    await this.store.saveValue("tempSet", numericTemperature);
  }
  async updateDeviceSilent(silent) {
    const { logger } = this.store;
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
    logger.debug(`Silent command response: ${JSON.stringify(data)}`);
    logger.info(`Silent mode set to: ${silent}`);
    await this.store.saveValue("silent", silent);
  }
  getAxiosUpdateDeviceSetTempParams(deviceCode, sTemperature) {
    return {
      param: ["R01", "R02", "R03", "Set_Temp"].map((code) => this.controlParam(deviceCode, code, sTemperature))
    };
  }
  getAxiosUpdateDeviceIdParams() {
    return this.isApiLevelLessThan3() ? { product_ids: import_axiosParameter.PRODUCT_IDS } : { productIds: import_axiosParameter.PRODUCT_IDS };
  }
  getAxiosUpdateDeviceIdParamsLegacy() {
    return { body: { productIds: import_axiosParameter.PRODUCT_IDS } };
  }
  getProtocolCodes() {
    return this.isApiLevelLessThan3() ? { device_code: this.store.device, protocal_codes: import_axiosParameter.CODES } : { deviceCode: this.store.device, protocalCodes: import_axiosParameter.CODES };
  }
  getAxiosUpdateDevicePowerParams(deviceCode, value, protocolCode) {
    return {
      param: [this.controlParam(deviceCode, protocolCode, value)]
    };
  }
  controlParam = (deviceCode, protocolCode, value) => {
    return this.store.apiLevel < 3 ? { device_code: deviceCode, protocol_code: protocolCode, value } : { deviceCode, protocolCode, value };
  };
  async saveSensors(responseValue) {
    const sensorCodes = DeviceController.getSensorCodes();
    const powerVal = (0, import_utils.parseFloatOrNull)((0, import_utils.findValByCodeArray)(responseValue, sensorCodes.tPower));
    const tVoltageVal = (0, import_utils.parseFloatOrNull)((0, import_utils.findValByCodeArray)(responseValue, sensorCodes.tVoltage));
    await this.store.saveValue("consumption", powerVal * tVoltageVal);
    const flowSwitchValue = (0, import_utils.findValByCodeArray)(responseValue, sensorCodes.flowSwitch);
    await this.saveSensorNumber("exhaust", responseValue, sensorCodes.exhaust);
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
    const val = (0, import_utils.findValByCodeArray)(res, code);
    await this.saveNumberIfValid(key, int ? (0, import_utils.parseIntOrNull)(val) : (0, import_utils.parseFloatOrNull)(val));
  }
  async updateDeviceErrorMsg() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
    const { apiLevel, cloudURL } = this.store;
    const res = this.getTokenAndDevice();
    if (!res) {
      return;
    }
    const sURL = apiLevel < 3 ? `${cloudURL}/app/device/getFaultDataByDeviceCode.json` : `${cloudURL}/app/device/getFaultDataByDeviceCode`;
    try {
      const data = await this.apiClient.request(
        sURL,
        {
          device_code: res.device,
          deviceCode: res.device
        },
        res.token
      );
      await this.store.saveValue("error", true);
      await this.store.saveValue(
        "errorMessage",
        (_f = (_e = (_b = (_a = data.objectResult) == null ? void 0 : _a[0]) == null ? void 0 : _b.description) != null ? _e : (_d = (_c = data.object_result) == null ? void 0 : _c[0]) == null ? void 0 : _d.description) != null ? _f : ""
      );
      await this.store.saveValue(
        "errorCode",
        (_k = (_h = (_g = data.objectResult) == null ? void 0 : _g[0]) == null ? void 0 : _h.faultCode) != null ? _k : (_j = (_i = data.object_result) == null ? void 0 : _i[0]) == null ? void 0 : _j.fault_code
      );
      await this.store.saveValue(
        "errorLevel",
        (_p = (_m = (_l = data.objectResult) == null ? void 0 : _l[0]) == null ? void 0 : _m.errorLevel) != null ? _p : (_o = (_n = data.object_result) == null ? void 0 : _n[0]) == null ? void 0 : _o.error_level
      );
    } catch (error) {
      throw new import_apiClient.ResetError("UpdateDeviceErrorMsg", { cause: error, sendToSentry: !(error instanceof import_apiClient.ApiError) });
    }
  }
  async updateDeviceMode(mode) {
    const { logger } = this.store;
    const res = this.getTokenAndDevice();
    if (!res) {
      return;
    }
    const data = await this.apiClient.request(
      this.store.getSUrl(),
      this.getAxiosUpdateDevicePowerParams(res.device, mode, "Mode"),
      res.token
    );
    logger.debug(`Mode command response: ${JSON.stringify(data)}`);
    if (this.isSuccess(data)) {
      await this.store.saveValue("mode", mode);
    } else {
      logger.error(`Failed to set mode ${mode}: API reported no success`);
    }
  }
  isSuccess(data) {
    return data.isReusltSuc;
  }
  static getSensorCodes() {
    return {
      tSuction: ["T01", "T1"],
      tIn: ["T02", "T2"],
      tOut: ["T03", "T3"],
      tCoil: ["T04", "T4"],
      tAmb: ["T05", "T5"],
      exhaust: ["T06", "T6"],
      tPower: ["T07", "T7"],
      flowSwitch: ["S03", "S3"],
      tVoltage: ["T14"],
      tRotor: ["T17"]
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
