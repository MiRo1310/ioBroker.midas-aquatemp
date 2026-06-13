import { expect } from 'chai';
import { describe, it } from 'mocha';
import { MidasAquatemp } from '../../src/main.ts';
import type { TMode } from '../../src/lib/store.ts';

const STATE_IDS = {
    modeId: 'midas-aquatemp.0.mode',
    silentId: 'midas-aquatemp.0.silent',
    stateId: 'midas-aquatemp.0.state',
    tempSetId: 'midas-aquatemp.0.tempSet',
};

describe('MidasAquatemp', () => {
    describe('isRelevant', () => {
        const isRelevant = (MidasAquatemp.prototype as any).isRelevant as (id: string) => boolean;

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        function ctx(device: string) {
            return { ...STATE_IDS, store: { device } };
        }

        it('returns true for each subscribed state id when device is set', () => {
            expect(isRelevant.call(ctx('DEV001'), STATE_IDS.modeId)).to.be.true;
            expect(isRelevant.call(ctx('DEV001'), STATE_IDS.silentId)).to.be.true;
            expect(isRelevant.call(ctx('DEV001'), STATE_IDS.stateId)).to.be.true;
            expect(isRelevant.call(ctx('DEV001'), STATE_IDS.tempSetId)).to.be.true;
        });

        it('returns false for an unknown state id', () => {
            expect(isRelevant.call(ctx('DEV001'), 'midas-aquatemp.0.unknown')).to.be.false;
        });

        it('returns false when device is empty', () => {
            expect(isRelevant.call(ctx(''), STATE_IDS.modeId)).to.be.false;
        });
    });

    describe('getMode', () => {
        const getMode = (MidasAquatemp.prototype as any).getMode as (state: { val: unknown }) => TMode;

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
