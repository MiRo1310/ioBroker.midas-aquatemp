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
var axiosParameter_exports = {};
__export(axiosParameter_exports, {
  getAxiosUpdateDeviceIdParams: () => getAxiosUpdateDeviceIdParams,
  getAxiosUpdateDevicePowerParams: () => getAxiosUpdateDevicePowerParams,
  getAxiosUpdateDeviceSetTempParams: () => getAxiosUpdateDeviceSetTempParams,
  getProtocolCodes: () => getProtocolCodes
});
module.exports = __toCommonJS(axiosParameter_exports);
var import_store = require("./store");
const PRODUCT_IDS = [
  "1132174963097280512",
  "1186904563333062656",
  "1158905952238313472",
  "1245226668902080512",
  "1442284873216843776",
  "1548963836789501952"
];
const CODES_POOLSANA = [
  "Power",
  "Mode",
  "Manual-mute",
  "T01",
  "T02",
  "2074",
  "2075",
  "2076",
  "2077",
  "H03",
  "Set_Temp",
  "R08",
  "R09",
  "R10",
  "R11",
  "R01",
  "R02",
  "R03",
  "T03",
  "1158",
  "1159",
  "F17",
  "H02",
  "T04",
  "T05",
  "T07",
  "T14",
  "T17",
  "S03"
];
const CODES_OTHER = [
  "Power",
  "Mode",
  "Manual-mute",
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "2074",
  "2075",
  "2076",
  "2077",
  "H03",
  "Set_Temp",
  "R08",
  "R09",
  "R10",
  "R11",
  "R01",
  "R02",
  "R03",
  "T03",
  "1158",
  "1159",
  "F17",
  "H02",
  "T7",
  "T14",
  "T17",
  "S3"
];
const getProtocolCodes = (store, productId) => {
  const codes = productId === import_store.Store.AQUATEMP_POOLSANA ? CODES_POOLSANA : CODES_OTHER;
  return store.apiLevel < 3 ? { device_code: store.device, protocal_codes: codes } : { deviceCode: store.device, protocalCodes: codes };
};
const getAxiosUpdateDeviceIdParams = (store) => {
  return store.apiLevel < 3 ? { product_ids: PRODUCT_IDS } : { productIds: PRODUCT_IDS };
};
const controlParam = (store, deviceCode, protocolCode, value) => {
  return store.apiLevel < 3 ? { device_code: deviceCode, protocol_code: protocolCode, value } : { deviceCode, protocolCode, value };
};
const getAxiosUpdateDevicePowerParams = (store, deviceCode, value, protocolCode) => {
  return {
    param: [controlParam(store, deviceCode, protocolCode, value)]
  };
};
const getAxiosUpdateDeviceSetTempParams = (deviceCode, sTemperature, store) => {
  return {
    param: ["R01", "R02", "R03", "Set_Temp"].map((code) => controlParam(store, deviceCode, code, sTemperature))
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAxiosUpdateDeviceIdParams,
  getAxiosUpdateDevicePowerParams,
  getAxiosUpdateDeviceSetTempParams,
  getProtocolCodes
});
//# sourceMappingURL=axiosParameter.js.map
