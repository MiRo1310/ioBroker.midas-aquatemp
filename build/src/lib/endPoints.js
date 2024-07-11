"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptionsAnsSUrl = exports.getSUrlUpdateDeviceId = exports.getSUrl = exports.setupEndpoints = void 0;
const store_1 = require("./store");
const store = (0, store_1.useStore)();
function setupEndpoints() {
    const apiLevel = store.apiLevel;
    if (apiLevel == 1) {
        store.cloudURL = "https://cloud.linked-go.com/cloudservice/api";
        return;
    }
    if (apiLevel == 2) {
        store.cloudURL = "https://cloud.linked-go.com/cloudservice/api";
        return;
    }
    if (apiLevel == 3) {
        store.cloudURL = "https://cloud.linked-go.com:449/crmservice/api";
    }
}
exports.setupEndpoints = setupEndpoints;
const getSUrl = () => {
    const cloudURL = store.cloudURL;
    if (store.apiLevel < 3) {
        return { sURL: cloudURL + "/app/device/control.json" };
    }
    return { sURL: cloudURL + "/app/device/control" };
};
exports.getSUrl = getSUrl;
const getSUrlUpdateDeviceId = () => {
    if (store.apiLevel < 3) {
        return { sURL: store.cloudURL + "/app/device/getDataByCode.json" };
    }
    return { sURL: store.cloudURL + "/app/device/getDataByCode" };
};
exports.getSUrlUpdateDeviceId = getSUrlUpdateDeviceId;
const getOptionsAnsSUrl = () => {
    const cloudURL = store.cloudURL;
    const apiLevel = store.apiLevel;
    const encryptedPassword = store.encryptedPassword;
    const username = store.username;
    if (apiLevel < 3) {
        return {
            sUrl: cloudURL + "/app/user/login.json",
            options: {
                user_name: username,
                password: encryptedPassword,
                type: "2",
            },
        };
    }
    return {
        sUrl: cloudURL + "/app/user/login",
        options: {
            userName: username,
            password: encryptedPassword,
            type: "2",
        },
    };
};
exports.getOptionsAnsSUrl = getOptionsAnsSUrl;
//# sourceMappingURL=endPoints.js.map