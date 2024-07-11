"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveValue = void 0;
const main_1 = require("../main");
const store_1 = require("./store");
let _this;
const saveValue = (key, value, stateType) => {
    const store = (0, store_1.useStore)();
    const dpRoot = store.getDpRoot();
    if (!_this) {
        _this = main_1.MidasAquatemp.getInstance();
    }
    const dp = dpRoot + "." + key;
    if (!_this.objectExists(dp)) {
        _this.setObjectNotExists(dp, {
            type: "state",
            common: {
                name: key,
                type: stateType,
                role: "value",
                read: true,
                write: false,
            },
            native: {},
        });
        return;
    }
    _this.setState(dp, value, true);
};
exports.saveValue = saveValue;
//# sourceMappingURL=saveValue.js.map