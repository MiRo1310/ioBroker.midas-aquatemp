import { expect } from 'chai';
import { describe, it } from 'mocha';
import { MidasAquatemp } from '../../src/main.ts';
import type { TMode } from '../../src/lib/store.ts';

describe('MidasAquatemp', () => {
    describe('getMode', () => {
        const getMode = (MidasAquatemp.prototype as any)['getMode'] as (state: { val: unknown }) => TMode;

        function ctx(storedMode: TMode): { store: { getMode: () => TMode } } {
            return { store: { getMode: () => storedMode } };
        }

        it('returns -1 when device is turned off (val = false)', () => {
            expect(getMode.call(ctx(1), { val: false })).to.equal(-1);
        });

        it('returns stored mode when device is turned on and mode is valid', () => {
            expect(getMode.call(ctx(0), { val: true })).to.equal(0); // kühlen
            expect(getMode.call(ctx(1), { val: true })).to.equal(1); // heizen
            expect(getMode.call(ctx(2), { val: true })).to.equal(2); // auto
        });

        it('falls back to 0 (kühlen) when device is turned on but stored mode is -1', () => {
            expect(getMode.call(ctx(-1), { val: true })).to.equal(0);
        });
    });
});
