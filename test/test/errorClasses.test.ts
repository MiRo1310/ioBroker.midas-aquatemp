import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';

import { ApiError, ResetError } from '../../src/lib/apiClient.ts';
import { Logger } from '../../src/lib/loggingController.ts';
import type { MidasAquatemp } from '../../src/main.ts';
import { utils } from '@iobroker/testing';

const { adapter } = utils.unit.createMocks({});

// Subclass Logger to intercept the private sendToSentry call without sinon.
// class SpyLogger extends Logger {
//     public sentryCalls = 0;
//
//     protected override sendToSentry(_e: any): void {
//         this.sentryCalls++;
//     }
// }

// SpyLogger must call the protected override — but sendToSentry is private in Logger.
// Re-expose it by casting to any in the helper below.
class TrackingSentryLogger extends Logger {
    public sentryCalls = 0;

    constructor(adapter: MidasAquatemp) {
        super(adapter);
        // Patch sendToSentry via prototype trickery to count invocations.
        const original = (this as any).__proto__.__proto__.sendToSentry;
        (this as any).sendToSentry = (e: any): void => {
            this.sentryCalls++;
            original.call(this, e);
        };
    }
}

describe('ApiError', () => {
    it('is an instance of Error', () => {
        const err = new ApiError('-100', 'https://example.com/api');
        expect(err).to.be.instanceOf(Error);
    });

    it('has name "ApiError"', () => {
        const err = new ApiError('-100', 'https://example.com/api');
        expect(err.name).to.equal('ApiError');
    });

    it('message contains the errorCode', () => {
        const err = new ApiError('-100', 'https://example.com/api');
        expect(err.message).to.include('-100');
    });

    it('message contains the url', () => {
        const err = new ApiError('-100', 'https://example.com/api');
        expect(err.message).to.include('https://example.com/api');
    });

    it('errorCode property is accessible and matches constructor argument', () => {
        const err = new ApiError(42, 'https://example.com/api');
        expect(err.errorCode).to.equal(42);
    });

    it('errorCode works with string values', () => {
        const err = new ApiError('ERR_SESSION', 'https://example.com/api');
        expect(err.errorCode).to.equal('ERR_SESSION');
    });
});

describe('ResetError', () => {
    it('is an instance of Error', () => {
        const err = new ResetError('something went wrong');
        expect(err).to.be.instanceOf(Error);
    });

    it('has name "ResetError"', () => {
        const err = new ResetError('something went wrong');
        expect(err.name).to.equal('ResetError');
    });

    it('message matches constructor argument', () => {
        const err = new ResetError('token expired');
        expect(err.message).to.equal('token expired');
    });

    it('sendToSentry defaults to true when options are omitted', () => {
        const err = new ResetError('no options');
        expect(err.sendToSentry).to.be.true;
    });

    it('sendToSentry defaults to true when options object does not include sendToSentry', () => {
        const err = new ResetError('no sentry key', {});
        expect(err.sendToSentry).to.be.true;
    });

    it('sendToSentry is false when explicitly set to false', () => {
        const err = new ResetError('silent reset', { sendToSentry: false });
        expect(err.sendToSentry).to.be.false;
    });

    it('sendToSentry is true when explicitly set to true', () => {
        const err = new ResetError('loud reset', { sendToSentry: true });
        expect(err.sendToSentry).to.be.true;
    });

    it('cause is accessible via error.cause when provided', () => {
        const cause = new Error('root cause');
        const err = new ResetError('wrapped', { cause });
        expect(err.cause).to.equal(cause);
    });

    it('cause is undefined when not provided', () => {
        const err = new ResetError('no cause');
        expect(err.cause).to.be.undefined;
    });
});

describe('Logger.errorHandler', () => {
    let logger: TrackingSentryLogger;

    beforeEach(() => {
        logger = new TrackingSentryLogger(adapter as unknown as MidasAquatemp);
        adapter.log.resetMockHistory();
    });

    it('does not throw for a plain Error', () => {
        expect(() => logger.errorHandler('title', new Error('plain error'))).to.not.throw();
    });

    it('does not throw for an ApiError', () => {
        expect(() => logger.errorHandler('title', new ApiError('-100', 'https://example.com'))).to.not.throw();
    });

    it('does not throw for a ResetError with sendToSentry=true', () => {
        expect(() => logger.errorHandler('title', new ResetError('reset', { sendToSentry: true }))).to.not.throw();
    });

    it('does not throw for a ResetError with sendToSentry=false', () => {
        expect(() => logger.errorHandler('title', new ResetError('silent', { sendToSentry: false }))).to.not.throw();
    });

    it('does not throw when useSentry=false regardless of error type', () => {
        expect(() => logger.errorHandler('title', new Error('any'), false)).to.not.throw();
    });

    it('skips sendToSentry for ApiError (shouldSendToSentry returns false)', () => {
        logger.errorHandler('title', new ApiError('-100', 'https://example.com'));
        expect(logger.sentryCalls).to.equal(0);
    });

    it('skips sendToSentry for ResetError with sendToSentry=false', () => {
        logger.errorHandler('title', new ResetError('silent', { sendToSentry: false }));
        expect(logger.sentryCalls).to.equal(0);
    });

    it('calls sendToSentry for a plain Error (shouldSendToSentry returns true)', () => {
        logger.errorHandler('title', new Error('plain'));
        expect(logger.sentryCalls).to.equal(1);
    });

    it('calls sendToSentry for ResetError with sendToSentry=true', () => {
        logger.errorHandler('title', new ResetError('loud', { sendToSentry: true }));
        expect(logger.sentryCalls).to.equal(1);
    });

    it('skips sendToSentry entirely when useSentry=false, even for a plain Error', () => {
        logger.errorHandler('title', new Error('plain'), false);
        expect(logger.sentryCalls).to.equal(0);
    });

    it('logs the title via adapter.log.error', () => {
        logger.errorHandler('My Error Title', new Error('details'));
        expect(adapter.log.error).to.have.been.calledWith('My Error Title');
    });

    it('logs error message via adapter.log.error', () => {
        logger.errorHandler('title', new Error('some detail message'));
        expect(adapter.log.error).to.have.been.calledWith('Error message: some detail message');
    });
});
