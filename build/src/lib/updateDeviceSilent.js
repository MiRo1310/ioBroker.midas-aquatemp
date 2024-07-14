"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeviceSilent = void 0;
const axiosParameter_1 = require("./axiosParameter");
const endPoints_1 = require("./endPoints");
const saveValue_1 = require("./saveValue");
const store_1 = require("./store");
const axios_1 = __importDefault(require("axios"));
async function updateDeviceSilent(deviceCode, silent) {
    const store = (0, store_1.initStore)();
    try {
        const token = store.token;
        let silentMode;
        if (silent) {
            silentMode = "1";
        }
        else {
            silentMode = "0";
        }
        if (token && token != "") {
            const { sURL } = (0, endPoints_1.getSUrl)();
            const response = await axios_1.default.post(sURL, (0, axiosParameter_1.getAxiosUpdateDevicePowerParams)({ deviceCode, value: silentMode, protocolCode: "Manual-mute" }), {
                headers: { "x-token": token },
            });
            store._this.log.info("DeviceStatus: " + JSON.stringify(response.data));
            if (parseInt(response.data.error_code) == 0) {
                (0, saveValue_1.saveValue)("silent", silent, "boolean");
                return;
            }
            store._this.log.error("Error: " + JSON.stringify(response.data));
            store.resetOnErrorHandler();
            (0, saveValue_1.saveValue)("info.connection", false, "boolean");
        }
    }
    catch (error) {
        store._this.log.error(JSON.stringify(error));
        store._this.log.error(JSON.stringify(error.stack));
    }
}
exports.updateDeviceSilent = updateDeviceSilent;
//# sourceMappingURL=updateDeviceSilent.js.map