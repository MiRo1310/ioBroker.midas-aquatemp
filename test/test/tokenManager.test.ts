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

    describe('ensureValidToken', () => {
        it('makes no API call when token is already valid', async () => {
            let callCount = 0;
            const client = {
                request: () => {
                    callCount++;
                    return { error_code: '0' };
                },
            } as unknown as ApiClient;
            tokenManager = new TokenManager(store, client);
            (tokenManager as any).token = 'existing-token';

            await tokenManager.ensureValidToken();

            expect(callCount).to.equal(0);
        });

        it('calls login API and sets token when token is null', async () => {
            const client = {
                request: () => ({ error_code: '0', objectResult: { 'x-token': 'fresh-token' } }),
            } as unknown as ApiClient;
            tokenManager = new TokenManager(store, client);

            await tokenManager.ensureValidToken();

            expect(tokenManager.getValidTokenOrNull()).to.equal('fresh-token');
        });

        it('keeps token null when login returns no token', async () => {
            const client = {
                request: () => ({ error_code: '0', objectResult: {} }),
            } as unknown as ApiClient;
            tokenManager = new TokenManager(store, client);

            await tokenManager.ensureValidToken();

            expect(tokenManager.getValidTokenOrNull()).to.be.null;
        });
    });

    describe('updateTokenAndDeviceId', () => {
        it('does not call fetchDevice when token stays invalid after login', async () => {
            let fetchDeviceCalled = false;
            const client = {
                request: () => ({ error_code: '0', objectResult: {} }),
            } as unknown as ApiClient;
            tokenManager = new TokenManager(store, client);
            tokenManager.setDeviceController({
                fetchDevice: () => {
                    fetchDeviceCalled = true;
                },
                updateDeviceStatus: async () => {},
            } as any);

            await tokenManager.updateTokenAndDeviceId();

            expect(fetchDeviceCalled).to.be.false;
        });

        it('calls fetchDevice when token is valid', async () => {
            let fetchDeviceCalled = false;
            const client = {
                request: () => ({ error_code: '0', objectResult: { 'x-token': 'token' } }),
            } as unknown as ApiClient;
            tokenManager = new TokenManager(store, client);
            tokenManager.setDeviceController({
                fetchDevice: () => {
                    fetchDeviceCalled = true;
                },
                updateDeviceStatus: async () => {},
            } as any);

            await tokenManager.updateTokenAndDeviceId();

            expect(fetchDeviceCalled).to.be.true;
        });

        it('calls updateDeviceStatus instead of fetchDevice when useDeviceMac is true', async () => {
            let fetchDeviceCalled = false;
            let updateStatusCalled = false;
            const storeWithMac = new Store(adapter as unknown as MidasAquatemp, 'user', 'pass', 0, 3, true, 'AA:BB:CC');
            const client = {
                request: () => ({ error_code: '0', objectResult: { 'x-token': 'token' } }),
            } as unknown as ApiClient;
            tokenManager = new TokenManager(storeWithMac, client);
            tokenManager.setDeviceController({
                fetchDevice: () => {
                    fetchDeviceCalled = true;
                },
                updateDeviceStatus: () => {
                    updateStatusCalled = true;
                },
            } as any);

            await tokenManager.updateTokenAndDeviceId();

            expect(fetchDeviceCalled).to.be.false;
            expect(updateStatusCalled).to.be.true;
        });
    });
});
