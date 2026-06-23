import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import { ConsecutiveErrorTracker } from '../../src/lib/consecutiveErrorTracker.ts';
import type { MidasAquatemp } from '../../src/main.ts';
import { utils } from '@iobroker/testing';

const { adapter } = utils.unit.createMocks({});

describe('ConsecutiveErrorTracker', () => {
    let cbCalls: unknown[];
    let cb: (e: any) => Promise<void>;
    let tracker: ConsecutiveErrorTracker;

    beforeEach(() => {
        adapter.log.debug.resetHistory();
        cbCalls = [];
        cb = (e: any): Promise<void> => {
            cbCalls.push(e);
            return Promise.resolve();
        };
        tracker = new ConsecutiveErrorTracker(cb, adapter as unknown as MidasAquatemp);
    });

    describe('addError', () => {
        it('does not invoke the callback before the threshold is reached', async () => {
            for (let i = 0; i < 4; i++) {
                await tracker.addError(new Error(`err-${i}`));
            }

            expect(cbCalls).to.have.length(0);
        });

        it('invokes the callback with the latest error once the threshold is exceeded', async () => {
            for (let i = 0; i < 4; i++) {
                await tracker.addError(new Error(`err-${i}`));
            }
            const last = new Error('err-4');
            await tracker.addError(last);

            expect(cbCalls).to.have.length(1);
            expect(cbCalls[0]).to.equal(last);
        });

        it('resets the error count after the callback was invoked', async () => {
            for (let i = 0; i < 5; i++) {
                await tracker.addError(new Error(`err-${i}`));
            }
            expect(cbCalls).to.have.length(1);

            for (let i = 0; i < 4; i++) {
                await tracker.addError(new Error(`err-${i}`));
            }
            expect(cbCalls).to.have.length(1);

            await tracker.addError(new Error('final'));
            expect(cbCalls).to.have.length(2);
        });

        it('logs message and stack for every error at debug level', async () => {
            const error = new Error('boom');
            await tracker.addError(error);

            expect(adapter.log.debug.calledWith(`Error message: ${error.message}`)).to.be.true;
            expect(adapter.log.debug.calledWith(`Error stack: ${error.stack}`)).to.be.true;
        });

        it('respects a custom acceptedErrors threshold', async () => {
            tracker = new ConsecutiveErrorTracker(cb, adapter as unknown as MidasAquatemp, 1);

            await tracker.addError(new Error('first'));
            expect(cbCalls).to.have.length(0);

            await tracker.addError(new Error('second'));
            expect(cbCalls).to.have.length(1);
        });
    });

    describe('resetErrors', () => {
        it('clears accumulated errors so the threshold starts fresh', async () => {
            for (let i = 0; i < 3; i++) {
                await tracker.addError(new Error(`err-${i}`));
            }
            tracker.resetErrors();

            for (let i = 0; i < 4; i++) {
                await tracker.addError(new Error(`err-${i}`));
            }

            expect(cbCalls).to.have.length(0);
        });
    });
});
