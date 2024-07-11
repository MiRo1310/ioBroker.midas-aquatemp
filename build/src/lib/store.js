"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStore = void 0;
const saveValue_1 = require("./saveValue");
const store = {
    _this: "",
    token: "",
    instance: null,
    username: "",
    encryptedPassword: "",
    cloudURL: "",
    apiLevel: 3,
    interval: 60000,
    device: "",
    product: "",
    reachable: false,
    // ProductIDs:
    // Gruppe 1:
    // 1132174963097280512: Midas/Poolsana InverPro
    AQUATEMP_POOLSANA: "1132174963097280512",
    // Gruppe 2:
    // 1442284873216843776:
    AQUATEMP_OTHER1: "1442284873216843776",
    getDpRoot: function () {
        return `midas-aquatemp.${this.instance}`;
    },
    resetOnErrorHandler: function () {
        this.token = "";
        this.device = "";
        this.reachable = false;
        (0, saveValue_1.saveValue)("info.connection", false, "boolean");
    },
};
const useStore = () => store;
exports.useStore = useStore;
//# sourceMappingURL=store.js.map