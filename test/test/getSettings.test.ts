import { expect } from 'chai';
import { describe, it } from 'mocha';
import { DeviceController } from '../../src/lib/deviceController.ts';
import type { TMode } from '../../src/lib/store.ts';

describe('DeviceController', () => {
    describe('getPowerMode', () => {
        it('returns powerOpt=0, powerMode=-1 for mode -1 (off)', () => {
            expect(DeviceController.getPowerMode(-1)).to.deep.equal({ powerOpt: 0, powerMode: -1 });
        });

        it('returns powerOpt=1, powerMode=0 for mode 0 (cool)', () => {
            expect(DeviceController.getPowerMode(0)).to.deep.equal({ powerOpt: 1, powerMode: 0 });
        });

        it('returns powerOpt=1, powerMode=1 for mode 1 (heat)', () => {
            expect(DeviceController.getPowerMode(1)).to.deep.equal({ powerOpt: 1, powerMode: 1 });
        });

        it('returns powerOpt=1, powerMode=2 for mode 2 (auto)', () => {
            expect(DeviceController.getPowerMode(2)).to.deep.equal({ powerOpt: 1, powerMode: 2 });
        });

        it('returns null values for any invalid mode', () => {
            expect(DeviceController.getPowerMode(99 as TMode)).to.deep.equal({ powerOpt: null, powerMode: null });
            expect(DeviceController.getPowerMode(-2 as TMode)).to.deep.equal({ powerOpt: null, powerMode: null });
            expect(DeviceController.getPowerMode(3 as TMode)).to.deep.equal({ powerOpt: null, powerMode: null });
        });
    });
});
