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
var endPoints_exports = {};
__export(endPoints_exports, {
  getOptionsAndSUrl: () => getOptionsAndSUrl,
  getSUrl: () => getSUrl,
  getSUrlUpdateDeviceId: () => getSUrlUpdateDeviceId,
  getUpdateDeviceIdSUrl: () => getUpdateDeviceIdSUrl,
  getUpdateDeviceStatusSUrl: () => getUpdateDeviceStatusSUrl,
  setupEndpoints: () => setupEndpoints
});
module.exports = __toCommonJS(endPoints_exports);
var import_store = require("./store");
function setupEndpoints() {
  const store = (0, import_store.initStore)();
  const apiLevel = store.apiLevel;
  if (apiLevel == 1) {
    store.cloudURL = "https://cloud.linked-go.com/cloudservice/api";
    return;
  }
  if (apiLevel == 2) {
    store.cloudURL = "https://cloud.linked-go.com/cloudservice/api";
    return;
  }
  if (apiLevel == 3) {
    store.cloudURL = "https://cloud.linked-go.com:449/crmservice/api";
  }
}
const getSUrl = () => {
  const store = (0, import_store.initStore)();
  const cloudURL = store.cloudURL;
  if (store.apiLevel < 3) {
    return { sURL: cloudURL + "/app/device/control.json" };
  }
  return { sURL: cloudURL + "/app/device/control" };
};
const getSUrlUpdateDeviceId = () => {
  const store = (0, import_store.initStore)();
  if (store.apiLevel < 3) {
    return { sURL: store.cloudURL + "/app/device/getDataByCode.json" };
  }
  return { sURL: store.cloudURL + "/app/device/getDataByCode" };
};
const getOptionsAndSUrl = () => {
  const store = (0, import_store.initStore)();
  const cloudURL = store.cloudURL;
  const apiLevel = store.apiLevel;
  const encryptedPassword = store.encryptedPassword;
  const username = store.username;
  if (apiLevel < 3) {
    return {
      sUrl: cloudURL + "/app/user/login.json",
      options: {
        user_name: username,
        password: encryptedPassword,
        type: "2"
      }
      // httpsAgent,
      // timeout: 5000,
    };
  }
  return {
    sUrl: cloudURL + "/app/user/login",
    options: {
      userName: username,
      password: encryptedPassword,
      type: "2"
    }
  };
};
const getUpdateDeviceStatusSUrl = () => {
  const store = (0, import_store.initStore)();
  if (store.apiLevel < 3) {
    return { sURL: store.cloudURL + "/app/device/getDeviceStatus.json" };
  }
  return { sURL: store.cloudURL + "/app/device/getDeviceStatus" };
};
const getUpdateDeviceIdSUrl = () => {
  const store = (0, import_store.initStore)();
  if (store.apiLevel < 3) {
    return { sURL: store.cloudURL + "/app/device/deviceList.json" };
  }
  return { sURL: store.cloudURL + "/app/device/deviceList" };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getOptionsAndSUrl,
  getSUrl,
  getSUrlUpdateDeviceId,
  getUpdateDeviceIdSUrl,
  getUpdateDeviceStatusSUrl,
  setupEndpoints
});
//# sourceMappingURL=endPoints.js.map
