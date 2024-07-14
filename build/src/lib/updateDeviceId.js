"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeviceID = void 0;
const axios_1 = __importDefault(require("axios"));
const main_1 = require("../main");
const axiosParameter_1 = require("./axiosParameter");
const endPoints_1 = require("./endPoints");
const saveValue_1 = require("./saveValue");
const store_1 = require("./store");
const updateDeviceStatus_1 = require("./updateDeviceStatus");
let _this;
async function updateDeviceID() {
    const store = (0, store_1.initStore)();
    try {
        if (!_this) {
            _this = main_1.MidasAquatemp.getInstance();
        }
        const { token, apiLevel } = store;
        if (!token) {
            return;
        }
        const { sURL } = (0, endPoints_1.getUpdateDeviceIdSUrl)();
        const response = await axios_1.default.post(sURL, (0, axiosParameter_1.getAxiosGetUpdateDeviceIdParams)(), {
            headers: { "x-token": token },
        });
        if (!response || response.status !== 200) {
            // Login-Fehler
            (0, saveValue_1.saveValue)("info.connection", false, "boolean");
            return;
        }
        if (response.data.error_code !== "0") {
            // Login-Fehler
            (0, saveValue_1.saveValue)("info.connection", false, "boolean");
            (store.token = ""), (store.device = ""), (store.reachable = false);
            return;
        }
        if (apiLevel < 3) {
            store.device = response.data.object_result[0]?.device_code;
            store.product = response.data.object_result[0]?.product_id;
            store.reachable = response.data.object_result[0]?.device_status == "ONLINE";
        }
        else {
            store.device = response.data.objectResult[0]?.deviceCode;
            store.product = response.data.objectResult[0]?.productId;
            store.reachable = response.data.objectResult[0]?.deviceStatus == "ONLINE";
        }
        (0, saveValue_1.saveValue)("DeviceCode", store.device, "string");
        (0, saveValue_1.saveValue)("ProductCode", store.product, "string");
        if (store.reachable && store.device) {
            (0, saveValue_1.saveValue)("info.connection", true, "boolean");
            if (store.device != "" && store.product) {
                await (0, updateDeviceStatus_1.updateDeviceStatus)();
            }
            return;
        }
        // offline
        store.device = "";
        (0, saveValue_1.saveValue)("info.connection", false, "boolean");
    }
    catch (error) {
        _this.log.error("Error in updateDeviceID(): " + JSON.stringify(error));
        _this.log.error("Error in updateDeviceID(): " + JSON.stringify(error.stack));
        (store.token = ""), (store.device = ""), (store.reachable = false);
    }
}
exports.updateDeviceID = updateDeviceID;
//# sourceMappingURL=updateDeviceId.js.map