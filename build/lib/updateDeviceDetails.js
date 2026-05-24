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
var updateDeviceDetails_exports = {};
__export(updateDeviceDetails_exports, {
  updateDeviceDetails: () => updateDeviceDetails
});
module.exports = __toCommonJS(updateDeviceDetails_exports);
var import_axiosParameter = require("./axiosParameter");
var import_endPoints = require("./endPoints");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
var import_logging = require("./logging");
var import_axios = require("./axios");
var import_utils = require("./utils");
async function saveNumberIfValid(adapter, key, value) {
  if (!Number.isFinite(value)) {
    return false;
  }
  await (0, import_saveValue.saveValue)({ key, value, stateType: "number", adapter });
  return true;
}
async function updateDeviceDetails(adapter) {
  var _a;
  const store = (0, import_store.initStore)();
  try {
    const { token, device: deviceCode, product } = store;
    if (!token || !deviceCode) {
      return;
    }
    const { sURL } = (0, import_endPoints.getSUrlUpdateDeviceId)();
    const { data, error } = await (0, import_axios.request)(
      adapter,
      sURL,
      (0, import_axiosParameter.getProtocolCodes)(deviceCode, product),
      (0, import_axiosParameter.getHeaders)(token)
    );
    if (!data || error) {
      store.resetOnErrorHandler();
      return;
    }
    adapter.log.debug(`DeviceDetails: ${JSON.stringify(data)}`);
    const responseValue = (_a = data.object_result) != null ? _a : data.objectResult;
    if (!responseValue || responseValue.length === 0) {
      return;
    }
    await (0, import_saveValue.saveValue)({
      key: "rawJSON",
      value: JSON.stringify(responseValue),
      stateType: "string",
      adapter
    });
    const isPoolsana = product === store.AQUATEMP_POOLSANA;
    const powerOn = (0, import_utils.findCodeVal)(responseValue, "Power") === "1";
    if (powerOn) {
      const tPower = isPoolsana ? "T07" : "T7";
      const tVoltage = "T14";
      const tSuction = isPoolsana ? "T01" : "T1";
      const tIn = isPoolsana ? "T02" : "T2";
      const tOut = "T03";
      const tCoil = isPoolsana ? "T04" : "T4";
      const tAmb = isPoolsana ? "T05" : "T5";
      const flowSwitch = isPoolsana ? "S03" : "S3";
      const powerVal = (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tPower));
      const tVoltageVal = (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tVoltage));
      const consumptionValue = (0, import_utils.isDefined)(powerVal) && (0, import_utils.isDefined)(tVoltageVal) ? powerVal * tVoltageVal : 0;
      await (0, import_saveValue.saveValue)({
        key: "consumption",
        value: consumptionValue,
        stateType: "number",
        adapter
      });
      const flowSwitchValue = (0, import_utils.findCodeVal)(responseValue, flowSwitch);
      await saveNumberIfValid(adapter, "suctionTemp", (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tSuction)));
      await saveNumberIfValid(adapter, "tempIn", (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tIn)));
      await saveNumberIfValid(adapter, "tempOut", (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tOut)));
      await saveNumberIfValid(adapter, "coilTemp", (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tCoil)));
      await saveNumberIfValid(adapter, "ambient", (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, tAmb)));
      await saveNumberIfValid(adapter, "voltage", tVoltageVal);
      await (0, import_saveValue.saveValue)({
        key: "flowSwitch",
        value: flowSwitchValue ? [1, "1", "true", true].includes(flowSwitchValue) : null,
        stateType: "boolean",
        adapter
      });
      await saveNumberIfValid(adapter, "rotor", (0, import_utils.parseIntOrNull)((0, import_utils.findCodeVal)(responseValue, "T17")));
    } else {
      await (0, import_saveValue.saveValue)({ key: "consumption", value: 0, stateType: "number", adapter });
      await (0, import_saveValue.saveValue)({ key: "rotor", value: 0, stateType: "number", adapter });
    }
    const setTempCandidates = ["Set_Temp", "R02", "R03", "R01"];
    let setTempValue = 0;
    for (const code of setTempCandidates) {
      setTempValue = (0, import_utils.parseNumberOrNull)((0, import_utils.findCodeVal)(responseValue, code));
      if (setTempValue !== null) {
        if (code !== "Set_Temp") {
          adapter.log.debug(`Set-temp fallback: ${code}=${setTempValue}`);
        }
        break;
      }
    }
    await saveNumberIfValid(adapter, "tempSet", setTempValue);
    await (0, import_saveValue.saveValue)({
      key: "silent",
      value: (0, import_utils.findCodeVal)(responseValue, "Manual-mute") === "1",
      stateType: "boolean",
      adapter
    });
    await (0, import_saveValue.saveValue)({ key: "state", value: powerOn, stateType: "boolean", adapter });
    await (0, import_saveValue.saveValue)({
      key: "mode",
      value: powerOn ? (0, import_utils.findCodeVal)(responseValue, "Mode") : "-1",
      stateType: "string",
      adapter
    });
    await (0, import_saveValue.saveValue)({ key: "info.connection", value: true, stateType: "boolean", adapter });
  } catch (error) {
    (0, import_logging.errorLogger)("Error updateDeviceDetails", error, adapter);
    store.resetOnErrorHandler();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceDetails
});
//# sourceMappingURL=updateDeviceDetails.js.map
