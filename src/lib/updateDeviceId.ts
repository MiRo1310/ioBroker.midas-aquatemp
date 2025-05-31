import type { MidasAquatemp } from '../main';
import { getAxiosUpdateDeviceIdParams, getHeaders } from './axiosParameter';
import { getUpdateDeviceIdSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { updateDeviceStatus } from './updateDeviceStatus';
import { errorLogger } from './logging';
import { request } from './axios';
import type { UpdateDeviceId } from '../types/types';
import { isToken, noError } from './utils';

export async function updateDeviceID(adapter: MidasAquatemp): Promise<void> {
    const store = initStore();
    try {
        const { token } = store;
        if (!isToken(token)) {
            return;
        }

        const { data, status } = await request<UpdateDeviceId>(
            adapter,
            getUpdateDeviceIdSUrl().sURL,
            getAxiosUpdateDeviceIdParams(),
            getHeaders(token),
        );

        adapter.log.debug(`UpdateDeviceID response: ${JSON.stringify(data)}, status: ${status}`);

        if (!data || status !== 200 || !noError(data.error_code)) {
            store.resetOnErrorHandler(); // Login-Fehler
            return;
        }

        if (!data?.object_result?.[0]?.device_code && !data?.objectResult?.[0]?.deviceCode) {
            adapter.log.error('Error in updateDeviceID: No device code found');
            return;
        }

        store.device = data.object_result?.[0].device_code ?? data.objectResult?.[0]?.deviceCode;
        store.product = data.object_result?.[0]?.product_id ?? data.objectResult?.[0]?.productId;
        store.reachable = (data.object_result?.[0]?.device_status ?? data.objectResult?.[0]?.deviceStatus) == 'ONLINE';

        adapter.log.debug(`device: ${store.device}, product: ${store.product}, reachable: ${store.reachable}`);

        await saveValue({ key: 'DeviceCode', value: store.device, stateType: 'string', adapter: adapter });
        await saveValue({ key: 'ProductCode', value: store.product, stateType: 'string', adapter: adapter });

        if (store.reachable && store.device) {
            await saveValue({ key: 'info.connection', value: true, stateType: 'boolean', adapter: adapter });
            if (store.device != '' && store.product) {
                adapter.log.debug('Update device status');
                await updateDeviceStatus(adapter);
            }
            return;
        }
        adapter.log.debug('Device not reachable');
        store.resetOnErrorHandler();
    } catch (error: any) {
        errorLogger('Error in updateDeviceID', error, adapter);

        store.token = '';
        store.device = '';
        store.reachable = false;
    }
}
