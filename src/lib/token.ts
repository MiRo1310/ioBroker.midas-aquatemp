import { getOptionsAndSUrl } from './endPoints';
import { initStore as useStore } from './store';
import { updateDeviceID } from './updateDeviceId';
import { updateDeviceStatus } from './updateDeviceStatus';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';
import { request } from './axios';
import type { RequestToken } from '../types/types';

async function getToken(adapter: MidasAquatemp): Promise<void> {
    const store = useStore();

    try {
        const { token } = store;

        if (token) {
            return;
        }

        adapter.log.debug('Request token');
        const { sUrl, options } = getOptionsAndSUrl();

        const { data, status } = await request<RequestToken>(adapter, sUrl, options);

        if (status !== 200 || !data) {
            adapter.log.error(`Login-error: ${JSON.stringify(data)}`);
            store.resetOnErrorHandler();
            return;
        }
        store.token = data?.object_result?.['x-token'] ?? data?.objectResult?.['x-token'] ?? null;

        if (store.token) {
            adapter.log.debug('Login ok! Token');
        } else {
            adapter.log.error(`Login-error: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        errorLogger('Error in getToken', error, adapter);
    }
}

export const updateToken = async (adapter: MidasAquatemp): Promise<void> => {
    const store = useStore();
    try {
        await getToken(adapter);

        if (!store.token) {
            store.resetOnErrorHandler();
            return;
        }
        if (store.useDeviceMac) {
            await updateDeviceStatus(adapter);
            return;
        }
        await updateDeviceID(adapter);
        return;
    } catch (error: any) {
        errorLogger('Error in updateToken', error, adapter);
    }
};
