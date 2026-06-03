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
var token_exports = {};
__export(token_exports, {
  ensureToken: () => ensureToken,
  updateToken: () => updateToken
});
module.exports = __toCommonJS(token_exports);
var import_endPoints = require("./endPoints");
var import_logging = require("./logging");
var import_axios = require("./axios");
var import_utils = require("./utils");
async function ensureToken(store) {
  await getToken(store);
}
async function getToken(store) {
  var _a, _b, _c, _d;
  const { token, adapter } = store;
  try {
    if ((0, import_utils.isToken)(token)) {
      return;
    }
    adapter.log.debug("Request token");
    const { sUrl, options } = (0, import_endPoints.getOptionsAndSUrl)(store);
    const { data, error } = await (0, import_axios.request)(adapter, sUrl, options);
    if (error || !data) {
      adapter.log.error(`Login-error: ${JSON.stringify(data)}`);
      await store.resetOnErrorHandler();
      return;
    }
    store.token = (_d = (_c = (_a = data == null ? void 0 : data.object_result) == null ? void 0 : _a["x-token"]) != null ? _c : (_b = data == null ? void 0 : data.objectResult) == null ? void 0 : _b["x-token"]) != null ? _d : null;
    if (store.token) {
      adapter.log.debug("Login ok! Token");
    } else {
      adapter.log.error(`Login-error: ${JSON.stringify(data)}`);
      await store.resetOnErrorHandler();
    }
  } catch (error) {
    (0, import_logging.errorLogger)("Error in getToken", error, adapter);
  }
}
const updateToken = async (store, deviceController) => {
  const { adapter } = store;
  try {
    await getToken(store);
    if (!store.token) {
      return;
    }
    if (store.useDeviceMac) {
      await deviceController.updateDeviceStatus();
      return;
    }
    await deviceController.updateDeviceID();
    return;
  } catch (error) {
    (0, import_logging.errorLogger)("Error in updateToken", error, adapter);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ensureToken,
  updateToken
});
//# sourceMappingURL=token.js.map
