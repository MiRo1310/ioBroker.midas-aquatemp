"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptPassword = void 0;
const crypto_1 = require("crypto");
const store_1 = require("./store");
function encryptPassword(password) {
    const store = (0, store_1.initStore)();
    store.encryptedPassword = (0, crypto_1.createHash)("md5").update(password).digest("hex");
}
exports.encryptPassword = encryptPassword;
//# sourceMappingURL=encryptPassword.js.map