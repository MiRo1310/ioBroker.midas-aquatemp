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
var import_protocolCodes = require("./protocolCodes");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
const store = (0, import_store.useStore)();
function updateDeviceDetails() {
  const { apiLevel, token, device: deviceCode, cloudURL, product } = store;
  if (token) {
    var sURL;
    if (apiLevel < 3) {
      sURL = cloudURL + "/app/device/getDataByCode.json";
    } else {
      sURL = cloudURL + "/app/device/getDataByCode";
    }
    import_axios.default.post(sURL, (0, import_protocolCodes.getProtocolCodes)(deviceCode), {
      headers: { "x-token": token }
    }).then(function(response) {
      if (parseInt(response.data.error_code) == 0) {
        if (apiLevel < 3) {
          (0, import_saveValue.saveValue)("rawJSON", JSON.stringify(response.data.object_result), "string");
          if (findCodeVal(response.data.object_result, "Power") == "1") {
            if (product == store.AQUATEMP_POOLSANA) {
              (0, import_saveValue.saveValue)("consumption", parseFloat(findCodeVal(response.data.object_result, "T07")) * parseFloat(findCodeVal(response.data.object_result, "T14")), "number");
              (0, import_saveValue.saveValue)("suctionTemp", parseFloat(findCodeVal(response.data.object_result, "T01")), "number");
              (0, import_saveValue.saveValue)("tempIn", parseFloat(findCodeVal(response.data.object_result, "T02")), "number");
              (0, import_saveValue.saveValue)("tempOut", parseFloat(findCodeVal(response.data.object_result, "T03")), "number");
              (0, import_saveValue.saveValue)("coilTemp", parseFloat(findCodeVal(response.data.object_result, "T04")), "number");
              (0, import_saveValue.saveValue)("ambient", parseFloat(findCodeVal(response.data.object_result, "T05")), "number");
              (0, import_saveValue.saveValue)("exhaust", parseFloat(findCodeVal(response.data.object_result, "T06")), "number");
            } else if (product == store.AQUATEMP_OTHER1) {
              (0, import_saveValue.saveValue)("consumption", parseFloat(findCodeVal(response.data.object_result, "T7")) * parseFloat(findCodeVal(response.data.object_result, "T14")), "number");
              (0, import_saveValue.saveValue)("suctionTemp", parseFloat(findCodeVal(response.data.object_result, "T1")), "number");
              (0, import_saveValue.saveValue)("tempIn", parseFloat(findCodeVal(response.data.object_result, "T2")), "number");
              (0, import_saveValue.saveValue)("tempOut", parseFloat(findCodeVal(response.data.object_result, "T3")), "number");
              (0, import_saveValue.saveValue)("coilTemp", parseFloat(findCodeVal(response.data.object_result, "T4")), "number");
              (0, import_saveValue.saveValue)("ambient", parseFloat(findCodeVal(response.data.object_result, "T5")), "number");
              (0, import_saveValue.saveValue)("exhaust", parseFloat(findCodeVal(response.data.object_result, "T6")), "number");
            }
            (0, import_saveValue.saveValue)("rotor", parseInt(findCodeVal(response.data.object_result, "T17")), "number");
          } else {
            (0, import_saveValue.saveValue)("consumption", 0, "number");
            (0, import_saveValue.saveValue)("rotor", 0, "number");
          }
          if (findCodeVal(response.data.object_result, "Mode") == 1) {
            (0, import_saveValue.saveValue)("tempSet", parseFloat(findCodeVal(response.data.object_result, "R02")), "number");
          } else if (findCodeVal(response.data.object_result, "Mode") == 0) {
            (0, import_saveValue.saveValue)("tempSet", parseFloat(findCodeVal(response.data.object_result, "R01")), "number");
          } else if (findCodeVal(response.data.object_result, "Mode") == 2) {
            (0, import_saveValue.saveValue)("tempSet", parseFloat(findCodeVal(response.data.object_result, "R03")), "number");
          }
          if (findCodeVal(response.data.object_result, "Manual-mute") == "1") {
            (0, import_saveValue.saveValue)("silent", true, "boolean");
          } else {
            (0, import_saveValue.saveValue)("silent", false, "boolean");
          }
          if (findCodeVal(response.data.object_result, "Power") == "1") {
            (0, import_saveValue.saveValue)("state", true, "boolean");
            (0, import_saveValue.saveValue)("mode", findCodeVal(response.data.object_result, "Mode"), "string");
          } else {
            (0, import_saveValue.saveValue)("state", false, "boolean");
            (0, import_saveValue.saveValue)("mode", "-1", "string");
          }
          (0, import_saveValue.saveValue)("info.connection", true, "boolean");
        } else {
          (0, import_saveValue.saveValue)("rawJSON", JSON.stringify(response.data.objectResult), "string");
          if (findCodeVal(response.data.objectResult, "Power") == "1") {
            if (product == store.AQUATEMP_POOLSANA) {
              (0, import_saveValue.saveValue)("consumption", parseFloat(findCodeVal(response.data.objectResult, "T07")) * parseFloat(findCodeVal(response.data.objectResult, "T14")), "number");
              (0, import_saveValue.saveValue)("suctionTemp", parseFloat(findCodeVal(response.data.objectResult, "T01")), "number");
              (0, import_saveValue.saveValue)("tempIn", parseFloat(findCodeVal(response.data.objectResult, "T02")), "number");
              (0, import_saveValue.saveValue)("tempOut", parseFloat(findCodeVal(response.data.objectResult, "T03")), "number");
              (0, import_saveValue.saveValue)("coilTemp", parseFloat(findCodeVal(response.data.objectResult, "T04")), "number");
              (0, import_saveValue.saveValue)("ambient", parseFloat(findCodeVal(response.data.objectResult, "T05")), "number");
              (0, import_saveValue.saveValue)("exhaust", parseFloat(findCodeVal(response.data.objectResult, "T06")), "number");
            } else if (product == store.AQUATEMP_OTHER1) {
              (0, import_saveValue.saveValue)("consumption", parseFloat(findCodeVal(response.data.objectResult, "T7")) * parseFloat(findCodeVal(response.data.objectResult, "T14")), "number");
              (0, import_saveValue.saveValue)("suctionTemp", parseFloat(findCodeVal(response.data.objectResult, "T1")), "number");
              (0, import_saveValue.saveValue)("tempIn", parseFloat(findCodeVal(response.data.objectResult, "T2")), "number");
              (0, import_saveValue.saveValue)("tempOut", parseFloat(findCodeVal(response.data.objectResult, "T3")), "number");
              (0, import_saveValue.saveValue)("coilTemp", parseFloat(findCodeVal(response.data.objectResult, "T4")), "number");
              (0, import_saveValue.saveValue)("ambient", parseFloat(findCodeVal(response.data.objectResult, "T5")), "number");
              (0, import_saveValue.saveValue)("exhaust", parseFloat(findCodeVal(response.data.objectResult, "T6")), "number");
            }
            (0, import_saveValue.saveValue)("rotor", parseInt(findCodeVal(response.data.objectResult, "T17")), "number");
          } else {
            (0, import_saveValue.saveValue)("consumption", 0, "number");
            (0, import_saveValue.saveValue)("rotor", 0, "number");
          }
          if (findCodeVal(response.data.objectResult, "Mode") == 1) {
            (0, import_saveValue.saveValue)("tempSet", parseFloat(findCodeVal(response.data.objectResult, "R02")), "number");
          } else if (findCodeVal(response.data.objectResult, "Mode") == 0) {
            (0, import_saveValue.saveValue)("tempSet", parseFloat(findCodeVal(response.data.objectResult, "R01")), "number");
          } else if (findCodeVal(response.data.objectResult, "Mode") == 2) {
            (0, import_saveValue.saveValue)("tempSet", parseFloat(findCodeVal(response.data.objectResult, "R03")), "number");
          }
          if (findCodeVal(response.data.objectResult, "Manual-mute") == "1") {
            (0, import_saveValue.saveValue)("silent", true, "boolean");
          } else {
            (0, import_saveValue.saveValue)("silent", false, "boolean");
          }
          if (findCodeVal(response.data.objectResult, "Power") == "1") {
            (0, import_saveValue.saveValue)("state", true, "boolean");
            (0, import_saveValue.saveValue)("mode", findCodeVal(response.data.objectResult, "Mode"), "string");
          } else {
            (0, import_saveValue.saveValue)("state", false, "boolean");
            (0, import_saveValue.saveValue)("mode", "-1", "string");
          }
          (0, import_saveValue.saveValue)("info.connection", true, "boolean");
        }
      } else {
        (0, import_saveValue.saveValue)("info.connection", false, "boolean");
        store.token = "", store.device = "", store.reachable = false;
        return;
      }
    }).catch(function(error) {
      store.token = "", store.device = "", store.reachable = false;
      (0, import_saveValue.saveValue)("info.connection", false, "boolean");
      return;
    });
  }
  return;
}
function findCodeVal(result, code) {
  for (var i = 0; i < result.length; i++) {
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
