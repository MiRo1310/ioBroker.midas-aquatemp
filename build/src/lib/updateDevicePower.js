"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDevicePower = void 0;
const utils_1 = require("./utils");
const store_1 = require("./store");
const endPoints_1 = require("./endPoints");
const axiosParameter_1 = require("./axiosParameter");
const saveValue_1 = require("./saveValue");
const axios_1 = __importDefault(require("axios"));
async function updateDevicePower(deviceCode, power) {
    const store = (0, store_1.initStore)();
    try {
        const token = store.token;
        const { powerMode, powerOpt } = (0, utils_1.getPowerMode)(power);
        if (powerOpt === null || powerMode === null) {
            return;
        }
        if (token && token != "") {
            const { sURL } = (0, endPoints_1.getSUrl)();
            const response = await axios_1.default.post(sURL, (0, axiosParameter_1.getAxiosUpdateDevicePowerParams)({ deviceCode, value: powerOpt, protocolCode: "Power" }), {
                headers: { "x-token": token },
            });
            store._this.log.info("DeviceStatus: " + JSON.stringify(response.data));
            if (parseInt(response.data.error_code) == 0) {
                (0, saveValue_1.saveValue)("mode", power.toString(), "string");
                if (power >= 0)
                    updateDeviceMode(store.device, power);
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
exports.updateDevicePower = updateDevicePower;
async function updateDeviceMode(deviceCode, mode) {
    const store = (0, store_1.initStore)();
    const token = store.token;
    try {
        if (token && token != "") {
            const { sURL } = (0, endPoints_1.getSUrl)();
            const response = await axios_1.default.post(sURL, (0, axiosParameter_1.getAxiosUpdateDevicePowerParams)({ deviceCode: deviceCode, value: mode, protocolCode: "mode" }), {
                headers: { "x-token": token },
            });
            store._this.log.info("DeviceStatus: " + JSON.stringify(response.data));
            if (parseInt(response.data.error_code) == 0) {
                (0, saveValue_1.saveValue)("mode", mode, "string");
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
//# sourceMappingURL=updateDevicePower.js.map