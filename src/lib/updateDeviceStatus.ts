import { getUpdateDeviceStatusSUrl } from './endPoints';
import type { Store } from './store';
import { updateDeviceDetails } from './updateDeviceDetails';
import { updateDeviceErrorMsg } from './updateDeviceOnError';
import { errorLogger } from './logging';
import { request } from './axios';
import { getHeaders } from './axiosParameter';
import type { DeviceStatus } from '../types/types';

export async function updateDeviceStatus(store: Store): Promise<void> {
    const { adapter } = store;
    try {
        const { token, device: deviceCode, apiLevel } = store;
        if (!token || !deviceCode) {
            return;
        }

        const { sURL } = getUpdateDeviceStatusSUrl(store);

        const payload = apiLevel < 3 ? { device_code: deviceCode } : { deviceCode };

        const { data, error } = await request<DeviceStatus>(adapter, sURL, payload, getHeaders(token));
        if (!data || error) {
            await store.resetOnErrorHandler();
            return;
        }

        adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

        const status = apiLevel < 3 ? data.object_result?.status : data.objectResult?.status;
        store.reachable = status === 'ONLINE';
        await store.saveValue('info.connection', store.reachable);
        if (!store.reachable) {
            return;
        }

        const isFault =
            apiLevel < 3 ? data.object_result?.is_fault : (data.objectResult?.is_fault ?? data.objectResult?.isFault);
        if (isFault === true) {
            await store.saveValue('error', true);
            await updateDeviceDetails(store);
            await updateDeviceErrorMsg(store);
            return;
        }

        await store.saveValue('error', false);
        await store.saveValue('errorMessage', '');
        await store.saveValue('errorCode', '');
        await store.saveValue('errorLevel', 0);
        await updateDeviceDetails(store);
    } catch (error: unknown) {
        await store.resetOnErrorHandler();
        errorLogger('Error in updateDeviceStatus', error, adapter);
    }
}
