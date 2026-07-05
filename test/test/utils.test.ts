import { expect } from 'chai';
import { describe, it } from 'mocha';

import { findCodeVal, findValByCodeArray, isDefined, isStateValue, toInt, toFloat } from '../../src/lib/utils.ts';

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

    describe('toFloat', () => {
        it('returns NaN for empty input', () => {
            expect(toFloat('')).to.be.NaN;
        });

        it('parses decimal values including comma notation', () => {
            expect(toFloat('12.5')).to.equal(12.5);
            expect(toFloat('12,5')).to.equal(12.5);
            expect(toFloat('-2,75')).to.equal(-2.75);
        });

        it('returns NaN for invalid numeric values', () => {
            expect(toFloat('abc')).to.be.NaN;
        });
    });

    describe('toInt', () => {
        it('returns NaN for empty input', () => {
            expect(toInt('')).to.be.NaN;
        });

        it('parses integer values', () => {
            expect(toInt('10')).to.equal(10);
            expect(toInt('-3')).to.equal(-3);
        });

        it('returns NaN for invalid values', () => {
            expect(toInt('abc')).to.be.NaN;
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
            expect(findCodeVal(response, 'UNKNOWN')).to.be.undefined;
        });
    });

    describe('findValByCodeArray', () => {
        const response = [
            { code: 'T01', value: '28.5' },
            { code: 'T1', value: '30.0' },
            { code: 'T2', value: '' },
            { code: 'T3', value: '22.0' },
        ];

        it('returns the value of the first matching code', () => {
            expect(findValByCodeArray(response, ['T01', 'T1'])).to.equal('28.5');
        });

        it('falls back to second code when first is not in result', () => {
            expect(findValByCodeArray(response, ['MISSING', 'T1'])).to.equal('30.0');
        });

        it('skips codes with empty string value and tries next', () => {
            expect(findValByCodeArray(response, ['T2', 'T3'])).to.equal('22.0');
        });

        it('returns undefined when no code matches', () => {
            expect(findValByCodeArray(response, ['X', 'Y'])).to.be.undefined;
        });

        it('returns undefined for empty codes array', () => {
            expect(findValByCodeArray(response, [])).to.be.undefined;
        });
    });
});
