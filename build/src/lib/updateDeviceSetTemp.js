"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeviceSetTemp = void 0;
const axios_1 = __importDefault(require("axios"));
const axiosParameter_1 = require("./axiosParameter");
const endPoints_1 = require("./endPoints");
const saveValue_1 = require("./saveValue");
const store_1 = require("./store");
const updateDeviceSetTemp = async (deviceCode, temperature) => {
    const store = (0, store_1.initStore)();
    const dpRoot = store.getDpRoot();
    try {
        const token = store.token;
        const sTemperature = temperature.toString().replace(",", ".");
        const result = await store._this.getStateAsync(dpRoot + ".mode");
        if (!result || !result.val) {
            return;
        }
        let sMode = result.val;
        if (sMode == "-1") {
            //log("Gerät einschalten um Temperatur zu ändern!", 'warn');
            return;
        }
        else if (sMode == "0") {
            sMode = "R01"; // Kühlen
        }
        else if (sMode == "1") {
            sMode = "R02"; // Heizen
        }
        else if (sMode == "2") {
            sMode = "R03"; // Auto
        }
        if (token && token != "") {
            const { sURL } = (0, endPoints_1.getSUrl)();
            const response = await axios_1.default.post(sURL, (0, axiosParameter_1.getAxiosUpdateDeviceSetTempParams)({ deviceCode, sTemperature }), {
                headers: { "x-token": token },
            });
            store._this.log.info("DeviceStatus: " + JSON.stringify(response.data));
            if (parseInt(response.data.error_code) == 0) {
                (0, saveValue_1.saveValue)("tempSet", temperature, "number");
                return;
            }
            store._this.log.error("Error: " + JSON.stringify(response.data));
            store.resetOnErrorHandler();
            (0, saveValue_1.saveValue)("info.connection", false, "boolean");
        }
    }
    catch (error) {
        store._this.log.error(JSON.stringify(error));
    }
};
exports.updateDeviceSetTemp = updateDeviceSetTemp;
//# sourceMappingURL=updateDeviceSetTemp.js.map