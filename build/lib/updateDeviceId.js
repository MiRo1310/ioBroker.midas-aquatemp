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
var updateDeviceId_exports = {};
__export(updateDeviceId_exports, {
  updateDeviceID: () => updateDeviceID
});
module.exports = __toCommonJS(updateDeviceId_exports);
var import_axios = __toESM(require("axios"));
var import_main = require("../main");
var import_saveValue = require("./saveValue");
var import_updateDeviceStatus = require("./updateDeviceStatus");
var import_store = require("./store");
const store = (0, import_store.useStore)();
let _this;
async function updateDeviceID() {
  if (!_this) {
    _this = import_main.MidasAquatemp.getInstance();
  }
  const { token, apiLevel, cloudURL } = store;
  if (token) {
    _this.log.info("Token: " + token);
    var sURL;
    if (apiLevel < 3) {
      sURL = cloudURL + "/app/device/deviceList.json";
    } else {
      sURL = cloudURL + "/app/device/deviceList";
    }
    const response = await import_axios.default.post(sURL, {
      "productIds": [
        "1132174963097280512",
        "1245226668902080512",
        "1656269521923575808",
        "1663080854333558784",
        "1596427678569979904",
        "1674238226096406528",
        "1650063968998252544",
        "1668781858447085568",
        "1186904563333062656",
        "1158905952238313472",
        "1442284873216843776",
        "1732565142225256450",
        "1548963836789501952",
        "1669159229372477440",
        "1650758828508766208",
        "1664085465655808000"
      ]
    }, {
      headers: { "x-token": token }
    });
    if (response && response.status == 200) {
      if (response.data.error_code == 0) {
        if (apiLevel < 3) {
          store.device = response.data.object_result[0].device_code;
          store.product = response.data.object_result[0].product_id;
          store.reachable = response.data.object_result[0].device_status == "ONLINE";
        } else {
          store.device = response.data.objectResult[0].deviceCode;
          store.product = response.data.objectResult[0].productId;
          store.reachable = response.data.objectResult[0].deviceStatus == "ONLINE";
        }
        (0, import_saveValue.saveValue)("DeviceCode", store.device, "string");
        (0, import_saveValue.saveValue)("ProductCode", store.product, "string");
        if (store.reachable && store.device) {
          (0, import_saveValue.saveValue)("info.connection", true, "boolean");
          if (store.device != "" && store.product) {
            await (0, import_updateDeviceStatus.updateDeviceStatus)();
          }
          ;
        } else {
          store.device = "";
          (0, import_saveValue.saveValue)("info.connection", false, "boolean");
        }
      } else {
        (0, import_saveValue.saveValue)("info.connection", false, "boolean");
        store.token = "", store.device = "", store.reachable = false;
      }
    }
    (0, import_saveValue.saveValue)("info.connection", false, "boolean");
  }
  store.token = "", store.device = "", store.reachable = false;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceID
});
//# sourceMappingURL=updateDeviceId.js.map
