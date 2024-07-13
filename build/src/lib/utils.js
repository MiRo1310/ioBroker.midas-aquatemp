"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPowerMode = void 0;
const getPowerMode = (power) => {
    switch (power) {
        case -1:
            // aus
            return {
                powerOpt: 0,
                powerMode: -1,
            };
        case 0:
            // an und kühlen
            return {
                powerOpt: 1,
                powerMode: 0,
            };
        case 1:
            // an und heizen
            return {
                powerOpt: 1,
                powerMode: 1,
            };
        case 2:
            // an und auto
            return {
                powerOpt: 1,
                powerMode: 2,
            };
        default:
            // log("ungülter Zustand!");
            return { powerOpt: null, powerMode: null };
    }
};
exports.getPowerMode = getPowerMode;
//# sourceMappingURL=utils.js.map