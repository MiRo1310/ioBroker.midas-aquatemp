import type { MidasAquatemp } from '../main';
import { getUpdateDeviceStatusSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { updateDeviceDetails } from './updateDeviceDetails';
import { updateDeviceErrorMsg } from './updateDeviceOnError';
import { errorLogger } from './logging';
import { request } from './axios';
import { getHeaders } from './axiosParameter';
import type { DeviceStatus } from '../types/types';

export async function updateDeviceStatus(adapter: MidasAquatemp): Promise<void> {
    const store = initStore();
    try {
        const { token, device: deviceCode, apiLevel } = store;
        if (!token || !deviceCode) {
            return;
        }

        const { sURL } = getUpdateDeviceStatusSUrl();

        const payload = apiLevel < 3 ? { device_code: deviceCode } : { deviceCode };

        const { data, error } = await request<DeviceStatus>(adapter, sURL, payload, getHeaders(token));
        if (!data || error) {
            await store.resetOnErrorHandler();
            return;
        }

        adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

        const status = apiLevel < 3 ? data.object_result?.status : data.objectResult?.status;
        store.reachable = status === 'ONLINE';
        await saveValue({ key: 'info.connection', value: store.reachable, stateType: 'boolean', adapter });
        if (!store.reachable) {
            return;
        }

        const isFault =
            apiLevel < 3 ? data.object_result?.is_fault : (data.objectResult?.is_fault ?? data.objectResult?.isFault);
        if (isFault === true) {
            await saveValue({ key: 'error', value: true, stateType: 'boolean', adapter });
            await updateDeviceDetails(adapter);
            await updateDeviceErrorMsg(adapter);
            return;
        }

        await saveValue({ key: 'error', value: false, stateType: 'boolean', adapter });
        await saveValue({ key: 'errorMessage', value: '', stateType: 'string', adapter });
        await saveValue({ key: 'errorCode', value: '', stateType: 'string', adapter });
        await saveValue({ key: 'errorLevel', value: 0, stateType: 'number', adapter });
        await updateDeviceDetails(adapter);
    } catch (error: unknown) {
        store.resetOnErrorHandler();
        errorLogger('Error in updateDeviceStatus', error, adapter);
    }
}
