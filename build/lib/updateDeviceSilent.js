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
var updateDeviceSilent_exports = {};
__export(updateDeviceSilent_exports, {
  updateDeviceSilent: () => updateDeviceSilent
});
module.exports = __toCommonJS(updateDeviceSilent_exports);
var import_axiosParameter = require("./axiosParameter");
var import_endPoints = require("./endPoints");
var import_saveValue = require("./saveValue");
var import_store = require("./store");
var import_logging = require("./logging");
var import_axios = require("./axios");
var import_utils = require("./utils");
async function updateDeviceSilent(adapter, deviceCode, silent) {
  const store = (0, import_store.initStore)();
  try {
    const token = store.token;
    const silentMode = silent ? "1" : "0";
    if (token && token != "") {
      const { sURL } = (0, import_endPoints.getSUrl)();
      const { data } = await (0, import_axios.request)(
        adapter,
        sURL,
        (0, import_axiosParameter.getAxiosUpdateDevicePowerParams)({ deviceCode, value: silentMode, protocolCode: "Manual-mute" }),
        (0, import_axiosParameter.getHeaders)(token)
      );
      if (!data || !(0, import_utils.noError)(data.error_code)) {
        store.resetOnErrorHandler();
        return;
      }
      adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);
      await (0, import_saveValue.saveValue)({ key: "silent", value: silent, stateType: "boolean", adapter });
    }
  } catch (error) {
    (0, import_logging.errorLogger)("Error in updateDeviceSilent", error, adapter);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  updateDeviceSilent
});
//# sourceMappingURL=updateDeviceSilent.js.map
