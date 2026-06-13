import { expect } from 'chai';
import { describe, it } from 'mocha';
import { isRelevantStateId, resolveOnOffMode } from '../../src/lib/utils.ts';

const STATE_IDS = {
    modeId: 'midas-aquatemp.0.mode',
    silentId: 'midas-aquatemp.0.silent',
    stateId: 'midas-aquatemp.0.state',
    tempSetId: 'midas-aquatemp.0.tempSet',
};
const KNOWN_IDS = Object.values(STATE_IDS);

describe('MidasAquatemp', () => {
    describe('isRelevantStateId', () => {
        it('returns true for each subscribed state id when device is set', () => {
            expect(isRelevantStateId(STATE_IDS.modeId, KNOWN_IDS, 'DEV001')).to.be.true;
            expect(isRelevantStateId(STATE_IDS.silentId, KNOWN_IDS, 'DEV001')).to.be.true;
            expect(isRelevantStateId(STATE_IDS.stateId, KNOWN_IDS, 'DEV001')).to.be.true;
            expect(isRelevantStateId(STATE_IDS.tempSetId, KNOWN_IDS, 'DEV001')).to.be.true;
        });

        it('returns false for an unknown state id', () => {
            expect(isRelevantStateId('midas-aquatemp.0.unknown', KNOWN_IDS, 'DEV001')).to.be.false;
        });

        it('returns false when device is empty', () => {
            expect(isRelevantStateId(STATE_IDS.modeId, KNOWN_IDS, '')).to.be.false;
        });

        it('returns false when device is undefined', () => {
            expect(isRelevantStateId(STATE_IDS.modeId, KNOWN_IDS, undefined)).to.be.false;
        });
    });

    describe('resolveOnOffMode', () => {
        it('returns -1 when device is turned off (val = false)', () => {
            expect(resolveOnOffMode(false, 1)).to.equal(-1);
        });

        it('returns stored mode when device is turned on and mode is valid', () => {
            expect(resolveOnOffMode(true, 0)).to.equal(0); // kühlen
            expect(resolveOnOffMode(true, 1)).to.equal(1); // heizen
            expect(resolveOnOffMode(true, 2)).to.equal(2); // auto
        });

        it('falls back to 0 (kühlen) when device is turned on but stored mode is -1', () => {
            expect(resolveOnOffMode(true, -1)).to.equal(0);
        });
    });
});
