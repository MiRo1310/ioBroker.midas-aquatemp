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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MidasAquatemp = void 0;
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an
const store_1 = require("./lib/store");
const utils = __importStar(require("@iobroker/adapter-core"));
const createState_1 = require("./lib/createState");
const encryptPassword_1 = require("./lib/encryptPassword");
const endPoints_1 = require("./lib/endPoints");
const saveValue_1 = require("./lib/saveValue");
const token_1 = require("./lib/token");
const updateDevicePower_1 = require("./lib/updateDevicePower");
const updateDeviceSilent_1 = require("./lib/updateDeviceSilent");
const updateDeviceSetTemp_1 = require("./lib/updateDeviceSetTemp");
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
        const store = (0, store_1.initStore)();
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
        await (0, createState_1.createObjects)();
        this.log.info("Objects created");
        clearValues();
        await (0, token_1.updateToken)();
        function clearValues() {
            (0, saveValue_1.saveValue)("error", true, "boolean");
            (0, saveValue_1.saveValue)("consumption", 0, "number");
            (0, saveValue_1.saveValue)("state", false, "boolean");
            (0, saveValue_1.saveValue)("rawJSON", null, "string");
        }
        updateIntervall = store._this.setInterval(async () => {
            try {
                // await updateToken();
                const mode = await store._this.getStateAsync(dpRoot + ".mode");
                if (mode && !mode.ack && mode.val) {
                    (0, updateDevicePower_1.updateDevicePower)(store.device, mode.val);
                }
                const silent = await this.getStateAsync(dpRoot + ".silent");
                if (silent && !silent.ack && silent.val) {
                    (0, updateDevicePower_1.updateDevicePower)(store.device, silent.val);
                }
            }
            catch (error) {
                store._this.log.error(JSON.stringify(error));
                store._this.log.error(JSON.stringify(error.stack));
            }
        }, store.interval * 1000);
        tokenRefreshTimer = this.setInterval(async function () {
            store.token = "";
            store._this.log.info("Token will be refreshed.");
            await (0, token_1.updateToken)();
        }, 3600000);
        this.on("stateChange", async (id, state) => {
            try {
                if (id === dpRoot + ".mode" && state && !state.ack) {
                    const mode = await this.getStateAsync(dpRoot + ".mode");
                    if (mode && mode.val) {
                        (0, updateDevicePower_1.updateDevicePower)(store.device, mode.val);
                    }
                }
                if (id === dpRoot + ".silent" && state && !state.ack) {
                    const silent = await this.getStateAsync(dpRoot + ".silent");
                    if (silent && silent.val) {
                        (0, updateDeviceSilent_1.updateDeviceSilent)(store.device, silent.val);
                    }
                }
                if (id === dpRoot + ".tempSet" && state && !state.ack) {
                    const tempSet = await this.getStateAsync(dpRoot + ".tempSet");
                    if (tempSet && tempSet.val) {
                        (0, updateDeviceSetTemp_1.updateDeviceSetTemp)(store.device, tempSet.val);
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
            this.clearInterval(tokenRefreshTimer);
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