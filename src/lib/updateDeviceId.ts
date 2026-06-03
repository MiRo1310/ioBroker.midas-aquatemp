import { getAxiosUpdateDeviceIdParams, getHeaders } from './axiosParameter';
import { getUpdateDeviceIdSUrl } from './endPoints';
import { updateDeviceStatus } from './updateDeviceStatus';
import { errorLogger } from './logging';
import { request } from './axios';
import type { UpdateDeviceId } from '../types/types';
import { isToken } from './utils';
import type { Store } from './store';

export async function updateDeviceID(store: Store): Promise<void> {
    const { adapter } = store;
    try {
        const { token } = store;
        if (!isToken(token)) {
            return;
        }

        const { data, status, error } = await request<UpdateDeviceId>(
            adapter,
            getUpdateDeviceIdSUrl(store).sURL,
            getAxiosUpdateDeviceIdParams(store),
            getHeaders(token),
        );

        adapter.log.debug(`UpdateDeviceID response: ${JSON.stringify(data)}, status: ${status}`);

        if (!data || error) {
            await store.resetOnErrorHandler(); // Login-Fehler
            return;
        }

        if (!data?.object_result?.[0]?.device_code && !data?.objectResult?.[0]?.deviceCode) {
            await store.resetOnErrorHandler();
            adapter.log.error(
                'No device code found. Maybe the token is not valid. Please check if there are not two usages of the same account. In the next loop the token will be refreshed.',
            );
            return;
        }

        store.device = data.object_result?.[0].device_code ?? data.objectResult?.[0]?.deviceCode;
        store.product = data.object_result?.[0]?.product_id ?? data.objectResult?.[0]?.productId ?? null;
        store.reachable = (data.object_result?.[0]?.device_status ?? data.objectResult?.[0]?.deviceStatus) == 'ONLINE';

        adapter.log.debug(`device: ${store.device}, product: ${store.product}, reachable: ${store.reachable}`);

        await store.saveValue('DeviceCode', store.device);
        await store.saveValue('ProductCode', store.product);

        if (store.reachable && store.device) {
            await store.saveValue('info.connection', true);
            if (store.device != '' && store.product) {
                await updateDeviceStatus(store);
            }
            return;
        }
        adapter.log.debug('Device not reachable');
        void store.resetOnErrorHandler();
    } catch (error: any) {
        errorLogger('Error in updateDeviceID', error, adapter);

        store.token = '';
        store.device = '';
        store.reachable = false;
    }
}
