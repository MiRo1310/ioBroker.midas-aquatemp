"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToken = void 0;
const axios_1 = __importDefault(require("axios"));
const endPoints_1 = require("./endPoints");
const store_1 = require("./store");
const updateDeviceId_1 = require("./updateDeviceId");
const store = (0, store_1.useStore)();
async function getToken() {
    const _this = store._this;
    try {
        const { token, apiLevel } = store;
        if (!token) {
            _this.log.info("Request token");
            const { sUrl, options } = (0, endPoints_1.getOptionsAnsSUrl)();
            const response = await axios_1.default.post(sUrl, options);
            if (response.status == 200) {
                if (apiLevel < 3) {
                    store.token = response.data?.object_result?.["x-token"];
                }
                else {
                    store.token = response.data?.objectResult?.["x-token"];
                }
                _this.log.info("Login ok! Token: " + token);
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
    try {
        await getToken();
        if (store.token) {
            await (0, updateDeviceId_1.updateDeviceID)();
            return;
        }
        store.resetOnErrorHandler();
        return;
    }
    catch (error) {
        store._this.log.error("Error in updateToken(): " + JSON.stringify(error));
        store._this.log.error("Error in updateToken(): " + JSON.stringify(error.stack));
    }
};
exports.updateToken = updateToken;
//# sourceMappingURL=token.js.map