import { expect } from 'chai';
import { describe, it } from 'mocha';

import { getPowerMode } from '../../src/lib/getSettings.ts';

describe('getSettings.ts', () => {
    describe('getPowerMode', () => {
        it('returns powerOpt=0, powerMode=-1 for mode -1 (off)', () => {
            expect(getPowerMode(-1)).to.deep.equal({ powerOpt: 0, powerMode: -1 });
        });

        it('returns powerOpt=1, powerMode=0 for mode 0 (cool)', () => {
            expect(getPowerMode(0)).to.deep.equal({ powerOpt: 1, powerMode: 0 });
        });

        it('returns powerOpt=1, powerMode=1 for mode 1 (heat)', () => {
            expect(getPowerMode(1)).to.deep.equal({ powerOpt: 1, powerMode: 1 });
        });

        it('returns powerOpt=1, powerMode=2 for mode 2 (auto)', () => {
            expect(getPowerMode(2)).to.deep.equal({ powerOpt: 1, powerMode: 2 });
        });

        it('returns null values for any invalid mode', () => {
            expect(getPowerMode(99)).to.deep.equal({ powerOpt: null, powerMode: null });
            expect(getPowerMode(-2)).to.deep.equal({ powerOpt: null, powerMode: null });
            expect(getPowerMode(3)).to.deep.equal({ powerOpt: null, powerMode: null });
        });
    });
});