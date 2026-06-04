import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import { TokenManager } from '../../src/lib/tokenManager.ts';
import { ApiClient } from '../../src/lib/apiClient.ts';
import { Store } from '../../src/lib/store.ts';
import type { MidasAquatemp } from '../../src/main.ts';
import { utils } from '@iobroker/testing';

const { adapter } = utils.unit.createMocks({});

describe('TokenManager', () => {
    let store: Store;
    let apiClient: ApiClient;
    let tokenManager: TokenManager;

    beforeEach(() => {
        store = new Store(adapter as unknown as MidasAquatemp, 'user@test.com', 'pass', 0);
        apiClient = new ApiClient(store);
        tokenManager = new TokenManager(store, apiClient);
    });

    describe('getValidTokenOrNull', () => {
        it('returns token when valid', () => {
            (tokenManager as any).token = 'valid-token';
            expect(tokenManager.getValidTokenOrNull()).to.equal('valid-token');
        });

        it('returns null for empty string', () => {
            (tokenManager as any).token = '';
            expect(tokenManager.getValidTokenOrNull()).to.be.null;
        });

        it('returns null for null', () => {
            (tokenManager as any).token = null;
            expect(tokenManager.getValidTokenOrNull()).to.be.null;
        });

        it('returns null for undefined', () => {
            (tokenManager as any).token = undefined;
            expect(tokenManager.getValidTokenOrNull()).to.be.null;
        });
    });

    describe('resetToken', () => {
        it('sets token to null', () => {
            (tokenManager as any).token = 'some-token';
            tokenManager.resetToken();
            expect(tokenManager.getValidTokenOrNull()).to.be.null;
        });
    });

    describe('setDeviceController', () => {
        it('stores the device controller reference', () => {
            const mockController = {} as any;
            tokenManager.setDeviceController(mockController);
            expect((tokenManager as any).deviceController).to.equal(mockController);
        });
    });

    describe('constructor', () => {
        it('registers itself with the store', () => {
            expect((store as any).tokenManager).to.equal(tokenManager);
        });

        it('starts with no valid token', () => {
            expect(tokenManager.getValidTokenOrNull()).to.be.null;
        });
    });
});
