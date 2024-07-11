"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeviceStatus = void 0;
const axios_1 = __importDefault(require("axios"));
const saveValue_1 = require("./saveValue");
const store_1 = require("./store");
const updateDeviceDetails_1 = require("./updateDeviceDetails");
const updateDeviceOnError_1 = require("./updateDeviceOnError");
const store = (0, store_1.useStore)();
async function updateDeviceStatus() {
    const { apiLevel, token, device: deviceCode, cloudURL } = store;
    if (token) {
        let sURL = "";
        if (apiLevel < 3) {
            sURL = cloudURL + "/app/device/getDeviceStatus.json";
        }
        else {
            sURL = cloudURL + "/app/device/getDeviceStatus";
        }
        const response = await axios_1.default.post(sURL, {
            device_code: deviceCode,
            deviceCode: deviceCode,
        }, {
            headers: { "x-token": token },
        });
        if (parseInt(response.data.error_code) == 0) {
            if (apiLevel < 3) {
                if (response.data.object_result["is_fault"] == true) {
                    // TODO: Fehlerbeschreibung abrufen
                    //clearValues();
                    (0, saveValue_1.saveValue)("error", true, "boolean");
                    (0, updateDeviceDetails_1.updateDeviceDetails)();
                    (0, updateDeviceOnError_1.updateDeviceErrorMsg)();
                }
                else {
                    // kein Fehler
                    (0, saveValue_1.saveValue)("error", false, "boolean");
                    (0, saveValue_1.saveValue)("errorMessage", "", "string");
                    (0, saveValue_1.saveValue)("errorCode", "", "string");
                    (0, saveValue_1.saveValue)("errorLevel", 0, "number");
                    (0, updateDeviceDetails_1.updateDeviceDetails)();
                }
            }
            else {
                if (response.data.objectResult["is_fault"] == true) {
                    // TODO: Fehlerbeschreibung abrufen
                    //clearValues();
                    (0, saveValue_1.saveValue)("error", true, "boolean");
                    (0, updateDeviceDetails_1.updateDeviceDetails)();
                    (0, updateDeviceOnError_1.updateDeviceErrorMsg)();
                }
                else {
                    // kein Fehler
                    (0, saveValue_1.saveValue)("error", false, "boolean");
                    (0, saveValue_1.saveValue)("errorMessage", "", "string");
                    (0, saveValue_1.saveValue)("errorCode", "", "string");
                    (0, saveValue_1.saveValue)("errorLevel", 0, "number");
                    (0, updateDeviceDetails_1.updateDeviceDetails)();
                }
            }
        }
        else {
            // log("Fehler in updateDeviceStatus(): " + JSON.stringify(response.data), "error");
            (0, saveValue_1.saveValue)("info.connection", false, "boolean");
        }
    }
    (store.token = ""), (store.device = ""), (store.reachable = false);
}
exports.updateDeviceStatus = updateDeviceStatus;
//# sourceMappingURL=updateDeviceStatus.js.map