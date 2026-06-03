import { getOptionsAndSUrl } from './endPoints';
import type { Store } from './store';
import { errorLogger } from './logging';
import { request } from './axios';
import type { RequestToken } from '../types/types';
import { isToken } from './utils';
import type { DeviceController } from './deviceController';

export async function ensureToken(store: Store): Promise<void> {
    await getToken(store);
}

async function getToken(store: Store): Promise<void> {
    const { token, adapter } = store;
    try {
        if (isToken(token)) {
            return;
        }

        adapter.log.debug('Request token');
        const { sUrl, options } = getOptionsAndSUrl(store);

        const { data, error } = await request<RequestToken>(adapter, sUrl, options);

        if (error || !data) {
            adapter.log.error(`Login-error: ${JSON.stringify(data)}`);
            await store.resetOnErrorHandler();
            return;
        }
        store.token = data?.object_result?.['x-token'] ?? data?.objectResult?.['x-token'] ?? null;

        if (store.token) {
            adapter.log.debug('Login ok! Token');
        } else {
            adapter.log.error(`Login-error: ${JSON.stringify(data)}`);
            await store.resetOnErrorHandler();
        }
    } catch (error) {
        errorLogger('Error in getToken', error, adapter);
    }
}

export const updateToken = async (store: Store, deviceController: DeviceController): Promise<void> => {
    const { adapter } = store;
    try {
        await getToken(store);

        if (!store.token) {
            return;
        }
        if (store.useDeviceMac) {
            await deviceController.updateDeviceStatus();
            return;
        }
        await deviceController.updateDeviceID();
        return;
    } catch (error: any) {
        errorLogger('Error in updateToken', error, adapter);
    }
};
