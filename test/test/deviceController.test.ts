import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import { DeviceController } from '../../src/lib/deviceController.ts';
import { Store } from '../../src/lib/store.ts';
import { TokenManager } from '../../src/lib/tokenManager.ts';
import type { ApiClient } from '../../src/lib/apiClient.ts';
import type { MidasAquatemp } from '../../src/main.ts';
import { utils } from '@iobroker/testing';

const { adapter } = utils.unit.createMocks({});

function makeApiClient(shouldThrow = false): ApiClient & { callCount: number } {
    const mock = {
        callCount: 0,
        request: () => {
            mock.callCount++;
            if (shouldThrow) {
                throw new Error('API error');
            }
            return { error_code: '0' };
        },
    } as unknown as ApiClient & { callCount: number };
    return mock;
}

const deviceResponse = {
    error_code: '0',
    objectResult: [{ deviceCode: 'DEV001', deviceStatus: 'ONLINE' }],
};
const emptyResponse = { error_code: '0', objectResult: [] };

function makeSequentialApiClient(
    ...responses: (object | Error)[]
): ApiClient & { callCount: number; calledWith: unknown[] } {
    let i = 0;
    const mock = {
        callCount: 0,
        calledWith: [] as unknown[],
        request: (_url: string, params: unknown) => {
            mock.callCount++;
            mock.calledWith.push(params);
            const res = responses[i] ?? responses[responses.length - 1];
            i++;
            if (res instanceof Error) {
                throw res;
            }
            return res;
        },
    } as unknown as ApiClient & { callCount: number; calledWith: unknown[] };
    return mock;
}

describe('DeviceController', () => {
    let store: Store;
    let tokenManager: TokenManager;
    let apiClient: ReturnType<typeof makeApiClient>;
    let controller: DeviceController;

    beforeEach(() => {
        store = new Store(adapter as unknown as MidasAquatemp, 'user', 'pass', 0);
        store.device = 'DEVICE_CODE';
        apiClient = makeApiClient();
        tokenManager = new TokenManager(store, apiClient);
        (tokenManager as any).token = 'test-token';
        controller = new DeviceController(store, tokenManager, apiClient);
        tokenManager.setDeviceController(controller);
    });

    describe('updateDevicePower', () => {
        it('makes no API call when token is missing', async () => {
            (tokenManager as any).token = null;
            await controller.updateDevicePower(-1);
            expect(apiClient.callCount).to.equal(0);
        });

        it('makes no API call when device is missing', async () => {
            store.device = undefined;
            await controller.updateDevicePower(-1);
            expect(apiClient.callCount).to.equal(0);
        });

        it('saves mode=-1 when turning off', async () => {
            await controller.updateDevicePower(-1);
            const state = await adapter.getStateAsync('midas-aquatemp.0.mode');
            expect(state?.val).to.equal(-1);
        });

        it('calls API twice for mode >= 0 (Power + Mode)', async () => {
            await controller.updateDevicePower(1);
            expect(apiClient.callCount).to.equal(2);
        });

        it('updates store mode for mode >= 0', async () => {
            await controller.updateDevicePower(1);
            expect(store.getMode()).to.equal(1);
        });

        it('keeps connection intact on API error (only logs)', async () => {
            apiClient = makeApiClient(true);
            controller = new DeviceController(store, tokenManager, apiClient);

            store.device = 'DEVICE_CODE';
            store.isOnline = true;

            await controller.updateDevicePower(1);

            expect(store.device).to.equal('DEVICE_CODE');
            expect(store.isOnline).to.be.true;
        });
    });

    describe('updateDeviceSilent', () => {
        it('makes no API call when token is missing', async () => {
            (tokenManager as any).token = null;
            await controller.updateDeviceSilent(true);
            expect(apiClient.callCount).to.equal(0);
        });

        it('saves silent=true on success', async () => {
            await controller.updateDeviceSilent(true);
            const state = await adapter.getStateAsync('midas-aquatemp.0.silent');
            expect(state?.val).to.be.true;
        });

        it('saves silent=false on success', async () => {
            await controller.updateDeviceSilent(false);
            const state = await adapter.getStateAsync('midas-aquatemp.0.silent');
            expect(state?.val).to.be.false;
        });

        it('keeps connection intact on API error (only logs)', async () => {
            apiClient = makeApiClient(true);
            controller = new DeviceController(store, tokenManager, apiClient);
            store.device = 'DEVICE_CODE';
            store.isOnline = true;

            await controller.updateDeviceSilent(true);

            expect(store.device).to.equal('DEVICE_CODE');
            expect(store.isOnline).to.be.true;
        });
    });

    describe('fetchDevice', () => {
        it('makes no API call when token is missing', async () => {
            (tokenManager as any).token = null;
            const client = makeSequentialApiClient(emptyResponse);
            controller = new DeviceController(store, tokenManager, client);
            await controller.fetchDevice();
            expect(client.callCount).to.equal(0);
        });

        it('sets device and apiType=default when default format succeeds', async () => {
            const client = makeSequentialApiClient(deviceResponse);
            controller = new DeviceController(store, tokenManager, client);
            await controller.fetchDevice();
            expect(store.device).to.equal('DEV001');
            expect((controller as any).apiType).to.equal('default');
        });

        it('falls back to legacy format when default returns no device, sets apiType=legacy', async () => {
            const client = makeSequentialApiClient(emptyResponse, deviceResponse);
            controller = new DeviceController(store, tokenManager, client);
            await controller.fetchDevice();
            expect(client.callCount).to.equal(2);
            expect(store.device).to.equal('DEV001');
            expect((controller as any).apiType).to.equal('legacy');
        });

        it('legacy format receives body-wrapped params', async () => {
            const client = makeSequentialApiClient(emptyResponse, deviceResponse);
            controller = new DeviceController(store, tokenManager, client);
            await controller.fetchDevice();
            const legacyParams = client.calledWith[1] as any;
            expect(legacyParams).to.have.property('body');
            expect(legacyParams.body).to.have.property('productIds');
        });

        it('calls resetDeviceOnly and sets apiType=null when both formats fail', async () => {
            const client = makeSequentialApiClient(emptyResponse, emptyResponse);
            controller = new DeviceController(store, tokenManager, client);
            store.isOnline = true;
            store.device = 'OLD_DEVICE';
            await controller.fetchDevice();
            expect(store.device).to.equal('');
            expect(store.isOnline).to.be.false;
            expect((controller as any).apiType).to.be.null;
        });

        it('skips legacy call when apiType=default is already cached', async () => {
            const client = makeSequentialApiClient(deviceResponse);
            controller = new DeviceController(store, tokenManager, client);
            (controller as any).apiType = 'default';
            await controller.fetchDevice();
            expect(client.callCount).to.equal(1);
        });

        it('skips default call and uses legacy directly when apiType=legacy is cached', async () => {
            const client = makeSequentialApiClient(deviceResponse);
            controller = new DeviceController(store, tokenManager, client);
            (controller as any).apiType = 'legacy';
            await controller.fetchDevice();
            expect(client.callCount).to.equal(1);
            const params = client.calledWith[0] as any;
            expect(params).to.have.property('body');
        });

        it('resets on API exception and does not set device', async () => {
            const client = makeSequentialApiClient(new Error('network error'));
            controller = new DeviceController(store, tokenManager, client);
            store.device = 'OLD_DEVICE';
            store.isOnline = true;
            await controller.fetchDevice();
            expect(store.device).to.equal('');
            expect(store.isOnline).to.be.false;
        });
    });

    describe('updateDeviceSetTemp', () => {
        beforeEach(async () => {
            await adapter.setState('midas-aquatemp.0.mode', { val: 1, ack: true });
        });

        it('makes no API call for invalid temperature', async () => {
            await controller.updateDeviceSetTemp(NaN);
            expect(apiClient.callCount).to.equal(0);
        });

        it('makes no API call when mode is -1 (device off)', async () => {
            await adapter.setState('midas-aquatemp.0.mode', { val: -1, ack: true });
            await controller.updateDeviceSetTemp(25);
            expect(apiClient.callCount).to.equal(0);
        });

        it('saves tempSet on success', async () => {
            await controller.updateDeviceSetTemp(25);
            const state = await adapter.getStateAsync('midas-aquatemp.0.tempSet');
            expect(state?.val).to.equal(25);
        });

        it('handles comma decimal notation', async () => {
            await controller.updateDeviceSetTemp(25);
            const state = await adapter.getStateAsync('midas-aquatemp.0.tempSet');
            expect(state?.val).to.equal(25);
        });

        it('keeps connection intact on API error (only logs)', async () => {
            apiClient = makeApiClient(true);
            controller = new DeviceController(store, tokenManager, apiClient);
            store.device = 'DEVICE_CODE';
            store.isOnline = true;

            await controller.updateDeviceSetTemp(25);

            expect(store.device).to.equal('DEVICE_CODE');
            expect(store.isOnline).to.be.true;
        });
    });
});
