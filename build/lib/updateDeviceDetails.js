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
  numberToBoolean: () => numberToBoolean,
  updateDeviceDetails: () => updateDeviceDetails
});
module.exports = __toCommonJS(updateDeviceDetails_exports);
var import_axiosParameter = require("./axiosParameter");
var import_endPoints = require("./endPoints");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
var import_logging = require("./logging");
var import_axios = require("./axios");
const numberToBoolean = (value) => {
  return value === 1;
};
const saveValues = async (adapter, value) => {
  await (0, import_saveValue.saveValue)({
    key: "consumption",
    value: parseFloat(findCodeVal(value, ["T07", "T7"])) * parseFloat(findCodeVal(value, "T14")),
    stateType: "number",
    adapter
  });
  await (0, import_saveValue.saveValue)({
    key: "suctionTemp",
    value: parseFloat(findCodeVal(value, ["T01", "T1"])),
    stateType: "number",
    adapter
  });
  await (0, import_saveValue.saveValue)({
    key: "tempIn",
    value: parseFloat(findCodeVal(value, ["T02", "T2"])),
    stateType: "number",
    adapter
  });
  await (0, import_saveValue.saveValue)({
    key: "tempOut",
    value: parseFloat(findCodeVal(value, ["T03", "T3"])),
    stateType: "number",
    adapter
  });
  await (0, import_saveValue.saveValue)({
    key: "coilTemp",
    value: parseFloat(findCodeVal(value, ["T04", "T4"])),
    stateType: "number",
    adapter
  });
  await (0, import_saveValue.saveValue)({
    key: "ambient",
    value: parseFloat(findCodeVal(value, ["T05", "T5"])),
    stateType: "number",
    adapter
  });
  await (0, import_saveValue.saveValue)({
    key: "exhaust",
    value: parseFloat(findCodeVal(value, ["T06", "T6"])),
    stateType: "number",
    adapter
  });
  await (0, import_saveValue.saveValue)({
    key: "flowSwitch",
    value: numberToBoolean(findCodeVal(value, ["S03", "S3"])),
    stateType: "boolean",
    adapter
  });
  await (0, import_saveValue.saveValue)({
    key: "rotor",
    value: parseInt(findCodeVal(value, "T17")),
    stateType: "number",
    adapter
  });
};
async function updateDeviceDetails(adapter) {
  var _a;
  const store = (0, import_store.initStore)();
  try {
    const { token, device: deviceCode } = store;
    if (!token || !deviceCode) {
      return;
    }
    const { sURL } = (0, import_endPoints.getSUrlUpdateDeviceId)();
    const { data, error } = await (0, import_axios.request)(
      adapter,
      sURL,
      (0, import_axiosParameter.getProtocolCodes)(deviceCode),
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
    await saveValues(adapter, responseValue);
    const mode = findCodeVal(responseValue, "Mode");
    const modes = {
      1: "R02",
      // Heiz-Modus (-> R02)
      0: "R01",
      // Kühl-Modus (-> R01)
      2: "R03"
      // Auto-Modus (-> R03)
    };
    await (0, import_saveValue.saveValue)({
      key: "tempSet",
      value: parseFloat(findCodeVal(responseValue, modes[mode])),
      stateType: "number",
      adapter
    });
    await (0, import_saveValue.saveValue)({
      key: "silent",
      value: findCodeVal(responseValue, "Manual-mute") == "1",
      stateType: "boolean",
      adapter
    });
    const powerOpt = findCodeVal(responseValue, "Power") === "1";
    await (0, import_saveValue.saveValue)({ key: "state", value: powerOpt, stateType: "boolean", adapter });
    await (0, import_saveValue.saveValue)({
      key: "mode",
      value: powerOpt ? findCodeVal(responseValue, "Mode") : "-1",
      stateType: "string",
      adapter
    });
    await (0, import_saveValue.saveValue)({ key: "info.connection", value: true, stateType: "boolean", adapter });
  } catch (error) {
    (0, import_logging.errorLogger)("Error updateDeviceDetails", error, adapter);
  }
}
function findCodeVal(result, code) {
  var _a, _b;
  if (!Array.isArray(code)) {
    return ((_a = result.find((item) => item.code === code)) == null ? void 0 : _a.value) || "";
  }
  for (let i = 0; i < code.length; i++) {
    const val = (_b = result.find((item) => item.code === code[i])) == null ? void 0 : _b.value;
    if (val !== "0" && val !== "") {
      return val;
    }
  }
  return "";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  numberToBoolean,
  updateDeviceDetails
});
//# sourceMappingURL=updateDeviceDetails.js.map
