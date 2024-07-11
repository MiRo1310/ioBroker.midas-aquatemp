"use strict";
/*
 * Created with @iobroker/create-adapter v2.6.3
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MidasAquatemp = void 0;
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = __importStar(require("@iobroker/adapter-core"));
const axios_1 = __importDefault(require("axios"));
const axiosParameter_1 = require("./lib/axiosParameter");
const createState_1 = require("./lib/createState");
const encryptPassword_1 = require("./lib/encryptPassword");
const endPoints_1 = require("./lib/endPoints");
const saveValue_1 = require("./lib/saveValue");
const store_1 = require("./lib/store");
const token_1 = require("./lib/token");
const utils_1 = require("./lib/utils");
const store = (0, store_1.useStore)();
let updateIntervall;
let tokenRefreshTimer;
class MidasAquatemp extends utils.Adapter {
    static instance;
    constructor(options = {}) {
        super({
            ...options,
            name: "midas-aquatemp",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("unload", this.onUnload.bind(this));
        MidasAquatemp.instance = this;
    }
    static getInstance() {
        return MidasAquatemp.instance;
    }
    async onReady() {
        store._this = this;
        store.instance = this.instance;
        const dpRoot = store.getDpRoot();
        this.setState("info.connection", false, true);
        store.username = this.config.username;
        const password = this.config.password;
        store.interval = this.config.refresh;
        store.apiLevel = this.config.selectApi;
        (0, endPoints_1.setupEndpoints)();
        (0, encryptPassword_1.encryptPassword)(password);
        (0, createState_1.createObjects)();
        clearValues();
        await (0, token_1.updateToken)();
        function clearValues() {
            (0, saveValue_1.saveValue)("error", true, "boolean");
            (0, saveValue_1.saveValue)("consumption", 0, "number");
            (0, saveValue_1.saveValue)("state", false, "boolean");
            (0, saveValue_1.saveValue)("rawJSON", null, "string");
        }
        async function updateDevicePower(deviceCode, power) {
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
                }
            }
            catch (error) {
                store._this.log.error(JSON.stringify(error));
                store._this.log.error(JSON.stringify(error.stack));
            }
        }
        async function updateDeviceMode(deviceCode, mode) {
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
                }
            }
            catch (error) {
                store._this.log.error(JSON.stringify(error));
                store._this.log.error(JSON.stringify(error.stack));
            }
        }
        async function updateDeviceSilent(deviceCode, silent) {
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
                }
            }
            catch (error) {
                store._this.log.error(JSON.stringify(error));
                store._this.log.error(JSON.stringify(error.stack));
            }
        }
        const updateDeviceSetTemp = async (deviceCode, temperature) => {
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
                }
            }
            catch (error) {
                store._this.log.error(JSON.stringify(error));
            }
        };
        updateIntervall = store._this.setInterval(async () => {
            try {
                // regelmäßig Token und Zustand abfragen
                await (0, token_1.updateToken)();
                const mode = await store._this.getStateAsync(dpRoot + ".mode");
                // gewünschte Änderungen ausführen
                if (mode && !mode.ack && mode.val) {
                    updateDevicePower(store.device, mode.val);
                }
                const silent = await this.getStateAsync(dpRoot + ".silent");
                if (silent && !silent.ack && silent.val) {
                    updateDevicePower(store.device, silent.val);
                }
            }
            catch (error) {
                store._this.log.error(JSON.stringify(error));
                store._this.log.error(JSON.stringify(error.stack));
            }
        }, store.interval * 1000);
        tokenRefreshTimer = setInterval(function () {
            // Token verfällt nach 60min
            store.token = "";
            //log("Token nach Intervall verworfen.")
            (0, token_1.updateToken)();
        }, 3600000);
        this.on("stateChange", async (id, state) => {
            try {
                if (id === dpRoot + ".mode" && state && !state.ack) {
                    (0, token_1.updateToken)();
                    const mode = await this.getStateAsync(dpRoot + ".mode");
                    if (mode && mode.val) {
                        updateDevicePower(store.device, mode.val);
                    }
                }
                if (id === dpRoot + ".silent" && state && !state.ack) {
                    (0, token_1.updateToken)();
                    const silent = await this.getStateAsync(dpRoot + ".silent");
                    if (silent && silent.val) {
                        updateDeviceSilent(store.device, silent.val);
                    }
                }
                if (id === dpRoot + ".tempSet" && state && !state.ack) {
                    (0, token_1.updateToken)();
                    const tempSet = await this.getStateAsync(dpRoot + ".tempSet");
                    if (tempSet && tempSet.val) {
                        updateDeviceSetTemp(store.device, tempSet.val);
                    }
                }
            }
            catch (error) {
                store._this.log.error(JSON.stringify(error));
                store._this.log.error(JSON.stringify(error.stack));
            }
        });
        this.subscribeStates("*");
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        try {
            this.clearInterval(updateIntervall);
            clearInterval(tokenRefreshTimer);
            callback();
        }
        catch (e) {
            callback();
        }
    }
}
exports.MidasAquatemp = MidasAquatemp;
if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options) => new MidasAquatemp(options);
}
else {
    // otherwise start the instance directly
    (() => new MidasAquatemp())();
}
//# sourceMappingURL=main.js.map