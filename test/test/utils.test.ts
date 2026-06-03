import { expect } from 'chai';
import { describe, it } from 'mocha';

import {
    findCodeVal,
    isApiSuccess,
    isDefined,
    isStateValue,
    isToken,
    parseIntOrNull,
    parseNumberOrNull,
} from '../../src/lib/utils.ts';

describe('utils.ts', () => {
    describe('isDefined', () => {
        it('returns false for undefined and null', () => {
            expect(isDefined(undefined)).to.be.false;
            expect(isDefined(null)).to.be.false;
        });

        it('returns true for falsy but defined values', () => {
            expect(isDefined(0)).to.be.true;
            expect(isDefined('')).to.be.true;
            expect(isDefined(false)).to.be.true;
        });
    });

    describe('isStateValue', () => {
        it('returns false when state is missing or has no value', () => {
            expect(isStateValue(undefined)).to.be.false;
            expect(isStateValue(null)).to.be.false;
            expect(isStateValue({ val: null } as any)).to.be.false;
            expect(isStateValue({} as any)).to.be.false;
        });

        it('returns true when state has a defined value', () => {
            expect(isStateValue({ val: 0 } as any)).to.be.true;
            expect(isStateValue({ val: false } as any)).to.be.true;
            expect(isStateValue({ val: '' } as any)).to.be.true;
        });
    });

    describe('isToken', () => {
        it('returns true only for non-empty strings', () => {
            expect(isToken('token')).to.be.true;
            expect(isToken('')).to.be.false;
            expect(isToken(undefined)).to.be.false;
            expect(isToken(null)).to.be.false;
        });
    });

    describe('isApiSuccess', () => {
        it('treats undefined and null as success', () => {
            expect(isApiSuccess(undefined)).to.be.true;
            expect(isApiSuccess(null as any)).to.be.true;
        });

        it('treats 0 values as success', () => {
            expect(isApiSuccess(0)).to.be.true;
            expect(isApiSuccess('0')).to.be.true;
        });

        it('treats non-zero and invalid values as failure', () => {
            expect(isApiSuccess(1)).to.be.false;
            expect(isApiSuccess('5')).to.be.false;
            expect(isApiSuccess('abc')).to.be.false;
        });
    });

    describe('parseNumberOrNull', () => {
        it('returns 0 for empty input', () => {
            expect(parseNumberOrNull('')).to.equal(0);
        });

        it('parses decimal values including comma notation', () => {
            expect(parseNumberOrNull('12.5')).to.equal(12.5);
            expect(parseNumberOrNull('12,5')).to.equal(12.5);
            expect(parseNumberOrNull('-2,75')).to.equal(-2.75);
        });

        it('returns 0 for invalid numeric values', () => {
            expect(parseNumberOrNull('abc')).to.equal(0);
        });
    });

    describe('parseIntOrNull', () => {
        it('returns 0 for empty input', () => {
            expect(parseIntOrNull('')).to.equal(0);
        });

        it('parses integer values', () => {
            expect(parseIntOrNull('10')).to.equal(10);
            expect(parseIntOrNull('-3')).to.equal(-3);
        });

        it('returns 0 for invalid values', () => {
            expect(parseIntOrNull('abc')).to.equal(0);
        });
    });

    describe('findCodeVal', () => {
        const response = [
            { code: 'A', value: '' },
            { code: 'B', value: 'second' },
            { code: 'C', value: 'third' },
        ];

        it('returns value for a single code', () => {
            expect(findCodeVal(response, 'B')).to.equal('second');
        });

        it('returns null when code is not found', () => {
            expect(findCodeVal(response, 'UNKNOWN')).to.be.null;
        });
    });
});
