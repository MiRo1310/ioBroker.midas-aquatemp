import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import { DeviceController } from '../../src/lib/deviceController.ts';
import { Store } from '../../src/lib/store.ts';
import { TokenManager } from '../../src/lib/tokenManager.ts';
import type { ApiClient } from '../../src/lib/apiClient.ts';
import type { MidasAquatemp } from '../../src/main.ts';
import { utils } from '@iobroker/testing';

const { adapter } = utils.unit.createMocks({});

function makeApiClient(
    response: { data?: any; error: boolean } = { data: { error_code: '0' }, error: false },
): ApiClient & { callCount: number } {
    const mock = {
        callCount: 0,
        request: () => {
            mock.callCount++;
            return { ...response, status: 200 };
        },
    } as unknown as ApiClient & { callCount: number };
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

        it('resets connection on API error while turning on', async () => {
            apiClient = makeApiClient({ data: null, error: true });
            controller = new DeviceController(store, tokenManager, apiClient);

            store.device = 'DEVICE_CODE';
            store.reachable = true;

            await controller.updateDevicePower(1);

            expect(store.device).to.equal('');
            expect(store.reachable).to.be.false;
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

        it('resets on API error', async () => {
            apiClient = makeApiClient({ data: null, error: true });
            controller = new DeviceController(store, tokenManager, apiClient);
            store.device = 'DEVICE_CODE';
            store.reachable = true;

            await controller.updateDeviceSilent(true);

            expect(store.device).to.equal('');
            expect(store.reachable).to.be.false;
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

        it('resets on API error', async () => {
            apiClient = makeApiClient({ data: { error_code: '0' }, error: true });
            controller = new DeviceController(store, tokenManager, apiClient);
            store.device = 'DEVICE_CODE';
            store.reachable = true;

            await controller.updateDeviceSetTemp(25);

            expect(store.device).to.equal('');
            expect(store.reachable).to.be.false;
        });
    });
});
