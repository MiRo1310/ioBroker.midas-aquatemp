"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeviceStatus = void 0;
const axios_1 = __importDefault(require("axios"));
const endPoints_1 = require("./endPoints");
const saveValue_1 = require("./saveValue");
const store_1 = require("./store");
const updateDeviceDetails_1 = require("./updateDeviceDetails");
const updateDeviceOnError_1 = require("./updateDeviceOnError");
async function updateDeviceStatus() {
    const store = (0, store_1.initStore)();
    const { token, device: deviceCode } = store;
    if (token) {
        const { sURL } = (0, endPoints_1.getUpdateDeviceStatusSUrl)();
        const response = await axios_1.default.post(sURL, {
            device_code: deviceCode,
            deviceCode: deviceCode,
        }, {
            headers: { "x-token": token },
        });
        if (parseInt(response.data.error_code) == 0) {
            if (response.data?.object_result?.["is_fault"] || response.data?.objectResult?.["isFault"]) {
                // TODO: Fehlerbeschreibung abrufen
                //clearValues();
                (0, saveValue_1.saveValue)("error", true, "boolean");
                (0, updateDeviceDetails_1.updateDeviceDetails)();
                (0, updateDeviceOnError_1.updateDeviceErrorMsg)();
                return;
            }
            // kein Fehler
            (0, saveValue_1.saveValue)("error", false, "boolean");
            (0, saveValue_1.saveValue)("errorMessage", "", "string");
            (0, saveValue_1.saveValue)("errorCode", "", "string");
            (0, saveValue_1.saveValue)("errorLevel", 0, "number");
            (0, updateDeviceDetails_1.updateDeviceDetails)();
            return;
        }
        (0, saveValue_1.saveValue)("info.connection", false, "boolean");
        return;
    }
    (store.token = ""), (store.device = ""), (store.reachable = false);
}
exports.updateDeviceStatus = updateDeviceStatus;
//# sourceMappingURL=updateDeviceStatus.js.map