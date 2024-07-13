"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeviceErrorMsg = void 0;
const axios_1 = __importDefault(require("axios"));
const saveValue_1 = require("./saveValue");
const store_1 = require("./store");
async function updateDeviceErrorMsg() {
    const store = (0, store_1.initStore)();
    try {
        const { token, apiLevel, cloudURL, device: deviceCode } = store;
        if (token) {
            let sURL = "";
            if (apiLevel < 3) {
                sURL = cloudURL + "/app/device/getFaultDataByDeviceCode.json";
            }
            else {
                sURL = cloudURL + "/app/device/getFaultDataByDeviceCode";
            }
            const response = await axios_1.default.post(sURL, {
                device_code: deviceCode,
                deviceCode: deviceCode,
            }, {
                headers: { "x-token": token },
            });
            if (parseInt(response.data.error_code) == 0) {
                (0, saveValue_1.saveValue)("error", true, "boolean");
                if (apiLevel < 3) {
                    (0, saveValue_1.saveValue)("errorMessage", response.data.object_result[0].description, "string");
                    (0, saveValue_1.saveValue)("errorCode", response.data.object_result[0].fault_code, "string");
                    (0, saveValue_1.saveValue)("errorLevel", response.data.object_result[0].error_level, "string");
                }
                else {
                    (0, saveValue_1.saveValue)("errorMessage", response.data.objectResult[0].description, "string");
                    (0, saveValue_1.saveValue)("errorCode", response.data.objectResult[0].fault_code, "string");
                    (0, saveValue_1.saveValue)("errorLevel", response.data.objectResult[0].error_level, "string");
                }
                return;
            }
            // Login-Fehler
            (store.token = ""), (store.device = ""), (store.reachable = false);
            (0, saveValue_1.saveValue)("info.connection", false, "boolean");
            return;
        }
        return;
    }
    catch (error) {
        store._this.log.error(JSON.stringify(error));
        store._this.log.error(JSON.stringify(error.stack));
    }
}
exports.updateDeviceErrorMsg = updateDeviceErrorMsg;
//# sourceMappingURL=updateDeviceOnError.js.map