"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptPassword = void 0;
const store_1 = require("./store");
const store = (0, store_1.useStore)();
const crypto_1 = require("crypto");
function encryptPassword(password) {
    store.encryptedPassword = (0, crypto_1.createHash)("md5").update(password).digest("hex");
}
exports.encryptPassword = encryptPassword;
//# sourceMappingURL=encryptPassword.js.map