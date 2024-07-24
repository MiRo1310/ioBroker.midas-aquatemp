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
  store.cloudURL = apiLevel == 3 ? "https://cloud.linked-go.com:449/crmservice/api" : "https://cloud.linked-go.com/cloudservice/api";
}
const getSUrl = () => {
  const store = (0, import_store.initStore)();
  const cloudURL = store.cloudURL;
  return store.apiLevel < 3 ? { sURL: cloudURL + "/app/device/control.json" } : { sURL: cloudURL + "/app/device/control" };
};
const getSUrlUpdateDeviceId = () => {
  const store = (0, import_store.initStore)();
  return store.apiLevel < 3 ? { sURL: store.cloudURL + "/app/device/getDataByCode.json" } : { sURL: store.cloudURL + "/app/device/getDataByCode" };
};
const getOptionsAndSUrl = () => {
  const store = (0, import_store.initStore)();
  const cloudURL = store.cloudURL;
  const apiLevel = store.apiLevel;
  const encryptedPassword = store.encryptedPassword;
  const username = store.username;
  return apiLevel < 3 ? {
    sUrl: cloudURL + "/app/user/login.json",
    options: {
      user_name: username,
      password: encryptedPassword,
      type: "2"
    }
  } : {
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
  return store.apiLevel < 3 ? { sURL: store.cloudURL + "/app/device/getDeviceStatus.json" } : { sURL: store.cloudURL + "/app/device/getDeviceStatus" };
};
const getUpdateDeviceIdSUrl = () => {
  const store = (0, import_store.initStore)();
  return store.apiLevel < 3 ? { sURL: store.cloudURL + "/app/device/deviceList.json" } : { sURL: store.cloudURL + "/app/device/deviceList" };
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
