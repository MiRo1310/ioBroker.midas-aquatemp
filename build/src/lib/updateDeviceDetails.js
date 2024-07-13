"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeviceDetails = void 0;
const axios_1 = __importDefault(require("axios"));
const axiosParameter_1 = require("./axiosParameter");
const endPoints_1 = require("./endPoints");
const saveValue_1 = require("./saveValue");
const store_1 = require("./store");
const isAuaTemp_Poolsana = (product) => {
    const store = (0, store_1.initStore)();
    if (product == store.AQUATEMP_POOLSANA) {
        return true;
    }
    else if (product == store.AQUATEMP_OTHER1) {
        return false;
    }
    return null;
};
const saveValues = (value, product) => {
    const isAquaTemp_Poolsana = isAuaTemp_Poolsana(product);
    if (isAquaTemp_Poolsana == null) {
        return;
    }
    // Stromverbrauch T07 x T14 in Watt
    (0, saveValue_1.saveValue)("consumption", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T07" : "T7")) * parseFloat(findCodeVal(value, "T14")), "number");
    // Luftansaug-Temperatur T01
    (0, saveValue_1.saveValue)("suctionTemp", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T01" : "T1")), "number");
    // Inlet-Temperatur T02
    (0, saveValue_1.saveValue)("tempIn", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T02" : "T2")), "number");
    // outlet-Temperatur T03
    (0, saveValue_1.saveValue)("tempOut", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T03" : "T3")), "number");
    // Coil-Temperatur T04
    (0, saveValue_1.saveValue)("coilTemp", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T04" : "T4")), "number");
    // Umgebungs-Temperatur T05
    (0, saveValue_1.saveValue)("ambient", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T05" : "T5")), "number");
    // Kompressorausgang-Temperatur T06
    (0, saveValue_1.saveValue)("exhaust", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T06" : "T6")), "number");
    // Lüfter-Drehzahl T17
    (0, saveValue_1.saveValue)("rotor", parseInt(findCodeVal(value, "T17")), "number");
};
async function updateDeviceDetails() {
    const store = (0, store_1.initStore)();
    try {
        const { apiLevel, token, device: deviceCode, product } = store;
        if (token) {
            const { sURL } = (0, endPoints_1.getSUrlUpdateDeviceId)();
            const response = await axios_1.default.post(sURL, (0, axiosParameter_1.getProtocolCodes)(deviceCode), {
                headers: { "x-token": token },
            });
            store._this.log.info("DeviceDetails: " + JSON.stringify(response.data));
            if (parseInt(response.data.error_code) == 0) {
                let responseValue;
                if (apiLevel < 3) {
                    responseValue = response.data.object_result;
                }
                else {
                    responseValue = response.data.objectResult;
                }
                (0, saveValue_1.saveValue)("rawJSON", JSON.stringify(responseValue), "string");
                saveValues(responseValue, product);
                // Ziel-Temperatur anhand Modus
                if (findCodeVal(responseValue, "Mode") == 1) {
                    // Heiz-Modus (-> R02)
                    (0, saveValue_1.saveValue)("tempSet", parseFloat(findCodeVal(responseValue, "R02")), "number");
                }
                else if (findCodeVal(response.data.object_result, "Mode") == 0) {
                    // Kühl-Modus (-> R01)
                    (0, saveValue_1.saveValue)("tempSet", parseFloat(findCodeVal(responseValue, "R01")), "number");
                }
                else if (findCodeVal(response.data.object_result, "Mode") == 2) {
                    // Auto-Modus (-> R03)
                    (0, saveValue_1.saveValue)("tempSet", parseFloat(findCodeVal(responseValue, "R03")), "number");
                }
                // Flüstermodus Manual-mute
                if (findCodeVal(responseValue, "Manual-mute") == "1") {
                    (0, saveValue_1.saveValue)("silent", true, "boolean");
                }
                else {
                    (0, saveValue_1.saveValue)("silent", false, "boolean");
                }
                // Zustand Power
                if (findCodeVal(responseValue, "Power") == "1") {
                    (0, saveValue_1.saveValue)("state", true, "boolean");
                    (0, saveValue_1.saveValue)("mode", findCodeVal(responseValue, "Mode"), "string");
                }
                else {
                    (0, saveValue_1.saveValue)("state", false, "boolean");
                    (0, saveValue_1.saveValue)("mode", "-1", "string");
                }
                (0, saveValue_1.saveValue)("info.connection", true, "boolean");
                return;
            }
            store._this.log.error("Error: " + JSON.stringify(response.data));
            (0, saveValue_1.saveValue)("info.connection", false, "boolean");
            store.token = "";
            store.device = "";
            store.reachable = false;
            return;
        }
        return;
    }
    catch (error) {
        store._this.log.error(JSON.stringify(error));
        store._this.log.error(JSON.stringify(error.stack));
    }
}
exports.updateDeviceDetails = updateDeviceDetails;
function findCodeVal(result, code) {
    return result.find((item) => item.code === code)?.value || "";
}
//# sourceMappingURL=updateDeviceDetails.js.map