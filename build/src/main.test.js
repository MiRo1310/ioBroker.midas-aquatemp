"use strict";
/**
 * This is a dummy TypeScript test file using chai and mocha
 *
 * It's automatically excluded from npm and its build output is excluded from both git and npm.
 * It is advised to test all your modules with accompanying *.test.ts-files
 */
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
// import { functionToTest } from "./moduleToTest";
describe("module to test => function to test", () => {
    // initializing logic
    const expected = 5;
    it(`should return ${expected}`, () => {
        const result = 5;
        // assign result a value from functionToTest
        (0, chai_1.expect)(result).to.equal(expected);
        // or using the should() syntax
        result.should.equal(expected);
    });
    // ... more tests => it
});
// ... more test suites => describe
//# sourceMappingURL=main.test.js.map