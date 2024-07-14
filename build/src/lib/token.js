"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToken = void 0;
const axios_1 = __importDefault(require("axios"));
const endPoints_1 = require("./endPoints");
const saveValue_1 = require("./saveValue");
const store_1 = require("./store");
const updateDeviceId_1 = require("./updateDeviceId");
async function getToken() {
    const store = (0, store_1.initStore)();
    const _this = store._this;
    try {
        const { token, apiLevel } = store;
        if (!token) {
            _this.log.info("Request token");
            const { sUrl, options } = (0, endPoints_1.getOptionsAndSUrl)();
            const response = await axios_1.default.post(sUrl, options);
            if (!response) {
                _this.log.error("No response from server");
                return;
            }
            if (response.status == 200) {
                store.token =
                    apiLevel < 3
                        ? (store.token = response.data?.object_result?.["x-token"])
                        : (store.token = response.data?.objectResult?.["x-token"]);
                _this.log.info("Login ok! Token: " + store.token);
                return;
            }
            _this.log.error("Login-error: " + response.data);
            store.token = null;
            return;
        }
        return;
    }
    catch (error) {
        _this.log.error("Error in getToken(): " + JSON.stringify(error));
    }
}
const updateToken = async () => {
    const store = (0, store_1.initStore)();
    try {
        await getToken();
        if (store.token) {
            await (0, updateDeviceId_1.updateDeviceID)();
            return;
        }
        store.resetOnErrorHandler();
        (0, saveValue_1.saveValue)("info.connection", false, "boolean");
        return;
    }
    catch (error) {
        store._this.log.error("Error in updateToken(): " + JSON.stringify(error));
        store._this.log.error("Error in updateToken(): " + JSON.stringify(error.stack));
    }
};
exports.updateToken = updateToken;
//# sourceMappingURL=token.js.map