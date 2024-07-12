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
  updateDeviceDetails: () => updateDeviceDetails
});
module.exports = __toCommonJS(updateDeviceDetails_exports);
var import_axios = __toESM(require("axios"));
var import_axiosParameter = require("./axiosParameter");
var import_endPoints = require("./endPoints");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
const isAuaTemp_Poolsana = (product) => {
  const store = (0, import_store.initStore)();
  if (product == store.AQUATEMP_POOLSANA) {
    return true;
  } else if (product == store.AQUATEMP_OTHER1) {
    return false;
  }
  return null;
};
const saveValues = (value, product) => {
  const isAquaTemp_Poolsana = isAuaTemp_Poolsana(product);
  if (isAquaTemp_Poolsana == null) {
    return;
  }
  (0, import_saveValue.saveValue)(
    "consumption",
    parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T07" : "T7")) * parseFloat(findCodeVal(value, "T14")),
    "number"
  );
  (0, import_saveValue.saveValue)("suctionTemp", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T01" : "T1")), "number");
  (0, import_saveValue.saveValue)("tempIn", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T02" : "T2")), "number");
  (0, import_saveValue.saveValue)("tempOut", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T03" : "T3")), "number");
  (0, import_saveValue.saveValue)("coilTemp", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T04" : "T4")), "number");
  (0, import_saveValue.saveValue)("ambient", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T05" : "T5")), "number");
  (0, import_saveValue.saveValue)("exhaust", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T06" : "T6")), "number");
  (0, import_saveValue.saveValue)("rotor", parseInt(findCodeVal(value, "T17")), "number");
};
async function updateDeviceDetails() {
  const store = (0, import_store.initStore)();
  try {
    const { apiLevel, token, device: deviceCode, product } = store;
    if (token) {
      const { sURL } = (0, import_endPoints.getSUrlUpdateDeviceId)();
      const response = await import_axios.default.post(sURL, (0, import_axiosParameter.getProtocolCodes)(deviceCode), {
        headers: { "x-token": token }
      });
      store._this.log.info("DeviceDetails: " + JSON.stringify(response.data));
      if (parseInt(response.data.error_code) == 0) {
        let responseValue;
        if (apiLevel < 3) {
          responseValue = response.data.object_result;
        } else {
          responseValue = response.data.objectResult;
        }
        (0, import_saveValue.saveValue)("rawJSON", JSON.stringify(responseValue), "string");
        if (findCodeVal(responseValue, "Power") == "1") {
          saveValues(responseValue, product);
        } else {
          (0, import_saveValue.saveValue)("consumption", 0, "number");
          (0, import_saveValue.saveValue)("rotor", 0, "number");
        }
        if (findCodeVal(responseValue, "Mode") == 1) {
          (0, import_saveValue.saveValue)("tempSet", parseFloat(findCodeVal(responseValue, "R02")), "number");
        } else if (findCodeVal(response.data.object_result, "Mode") == 0) {
          (0, import_saveValue.saveValue)("tempSet", parseFloat(findCodeVal(responseValue, "R01")), "number");
        } else if (findCodeVal(response.data.object_result, "Mode") == 2) {
          (0, import_saveValue.saveValue)("tempSet", parseFloat(findCodeVal(responseValue, "R03")), "number");
        }
        if (findCodeVal(responseValue, "Manual-mute") == "1") {
          (0, import_saveValue.saveValue)("silent", true, "boolean");
        } else {
          (0, import_saveValue.saveValue)("silent", false, "boolean");
        }
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
      (0, import_saveValue.saveValue)("info.connection", false, "boolean");
      store.token = "", store.device = "", store.reachable = false;
      return;
    }
    return;
  } catch (error) {
    store._this.log.error(JSON.stringify(error));
    store._this.log.error(JSON.stringify(error.stack));
  }
}
function findCodeVal(result, code) {
  for (let i = 0; i < result.length; i++) {
    if (result[i].code.indexOf(code) >= 0) {
      return result[i].value;
    }
  }
  return "";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceDetails
});
//# sourceMappingURL=updateDeviceDetails.js.map
