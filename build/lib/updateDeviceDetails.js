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
var updateDeviceDetails_exports = {};
__export(updateDeviceDetails_exports, {
  numberToBoolean: () => numberToBoolean,
  updateDeviceDetails: () => updateDeviceDetails
});
module.exports = __toCommonJS(updateDeviceDetails_exports);
var import_axios = __toESM(require("axios"));
var import_axiosParameter = require("./axiosParameter");
var import_endPoints = require("./endPoints");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
const numberToBoolean = (value) => {
  return value === 1;
};
const saveValues = (value) => {
  (0, import_saveValue.saveValue)(
    "consumption",
    parseFloat(findCodeVal(value, ["T07", "T7"])) * parseFloat(findCodeVal(value, "T14")),
    "number"
  );
  (0, import_saveValue.saveValue)("suctionTemp", parseFloat(findCodeVal(value, ["T01", "T1"])), "number");
  (0, import_saveValue.saveValue)("tempIn", parseFloat(findCodeVal(value, ["T02", "T2"])), "number");
  (0, import_saveValue.saveValue)("tempOut", parseFloat(findCodeVal(value, ["T03", "T3"])), "number");
  (0, import_saveValue.saveValue)("coilTemp", parseFloat(findCodeVal(value, ["T04", "T4"])), "number");
  (0, import_saveValue.saveValue)("ambient", parseFloat(findCodeVal(value, ["T05", "T5"])), "number");
  (0, import_saveValue.saveValue)("exhaust", parseFloat(findCodeVal(value, ["T06", "T6"])), "number");
  (0, import_saveValue.saveValue)("flowSwitch", numberToBoolean(findCodeVal(value, ["S03", "S3"])), "boolean");
  (0, import_saveValue.saveValue)("rotor", parseInt(findCodeVal(value, "T17")), "number");
};
async function updateDeviceDetails() {
  const store = (0, import_store.initStore)();
  try {
    const { apiLevel, token, device: deviceCode } = store;
    if (token) {
      const { sURL } = (0, import_endPoints.getSUrlUpdateDeviceId)();
      const response = await import_axios.default.post(sURL, (0, import_axiosParameter.getProtocolCodes)(deviceCode), {
        headers: { "x-token": token }
      });
      store._this.log.info("DeviceDetails: " + JSON.stringify(response.data));
      if (parseInt(response.data.error_code) == 0) {
        const responseValue = apiLevel < 3 ? response.data.object_result : response.data.objectResult;
        (0, import_saveValue.saveValue)("rawJSON", JSON.stringify(responseValue), "string");
        saveValues(responseValue);
        const mode = findCodeVal(responseValue, "Mode");
        const modes = {
          1: "R02",
          // Heiz-Modus (-> R02)
          0: "R01",
          // Kühl-Modus (-> R01)
          2: "R03"
          // Auto-Modus (-> R03)
        };
        (0, import_saveValue.saveValue)("tempSet", parseFloat(findCodeVal(responseValue, modes[mode])), "number");
        (0, import_saveValue.saveValue)("silent", findCodeVal(responseValue, "Manual-mute") == "1", "boolean");
        if (findCodeVal(responseValue, "Power") == "1") {
          (0, import_saveValue.saveValue)("state", true, "boolean");
          (0, import_saveValue.saveValue)("mode", findCodeVal(responseValue, "Mode"), "string");
        } else {
          (0, import_saveValue.saveValue)("state", false, "boolean");
          (0, import_saveValue.saveValue)("mode", "-1", "string");
        }
        (0, import_saveValue.saveValue)("info.connection", true, "boolean");
        return;
      }
      store._this.log.error("Error: " + JSON.stringify(response.data));
      store.resetOnErrorHandler();
      return;
    }
    return;
  } catch (error) {
    store._this.log.error(JSON.stringify(error));
    store._this.log.error(JSON.stringify(error.stack));
  }
}
function findCodeVal(result, code) {
  var _a, _b;
  if (!Array.isArray(code)) {
    return ((_a = result.find((item) => item.code === code)) == null ? void 0 : _a.value) || "";
  }
  for (let i = 0; i < code.length; i++) {
    const val = (_b = result.find((item) => item.code === code[i])) == null ? void 0 : _b.value;
    if (val !== "0") {
      return val;
    }
  }
  return "0";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  numberToBoolean,
  updateDeviceDetails
});
//# sourceMappingURL=updateDeviceDetails.js.map
