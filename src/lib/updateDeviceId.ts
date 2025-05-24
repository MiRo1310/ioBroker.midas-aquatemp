import axios from 'axios';
import type { MidasAquatemp } from '../main';
import { getAxiosUpdateDeviceIdParams } from './axiosParameter';
import { getUpdateDeviceIdSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { updateDeviceStatus } from './updateDeviceStatus';
import { errorLogger } from './logging';

export async function updateDeviceID(adapter: MidasAquatemp): Promise<void> {
    const store = initStore();
    try {
        const { token, apiLevel } = store;
        if (!token) {
            return;
        }
        const { sURL } = getUpdateDeviceIdSUrl();
        const options = getAxiosUpdateDeviceIdParams();
        adapter.log.debug(`UpdateDeviceID URL: ${sURL}`);
        adapter.log.debug(`UpdateDeviceID options: ${JSON.stringify(options)}`);

        const response = await axios.post(sURL, options, {
            headers: { 'x-token': token },
        });

        adapter.log.debug(`UpdateDeviceID response: ${JSON.stringify(response.data)}`);
        adapter.log.debug(`UpdateDeviceID response status: ${JSON.stringify(response.status)}`);

        if (!response || response.status !== 200 || response.data.error_code !== '0') {
            // Login-Fehler
            store.resetOnErrorHandler();
            return;
        }

        if (!response.data?.object_result?.[0]?.device_code && !response.data?.objectResult?.[0]?.deviceCode) {
            adapter.log.error('Error in updateDeviceID: No device code found');
            adapter.log.error(`Response: ${JSON.stringify(response.data)}`);
            return;
        }

        if (apiLevel < 3) {
            store.device = response.data.object_result[0]?.device_code;
            store.product = response.data.object_result[0]?.product_id;
            store.reachable = response.data.object_result[0]?.device_status == 'ONLINE';
        } else {
            store.device = response.data.objectResult[0]?.deviceCode;
            store.product = response.data.objectResult[0]?.productId;
            store.reachable = response.data.objectResult[0]?.deviceStatus == 'ONLINE';
        }
        adapter.log.debug(`Device: ${store.device}`);
        adapter.log.debug(`Product: ${store.product}`);
        adapter.log.debug(`Reachable: ${store.reachable}`);

        await saveValue('DeviceCode', store.device, 'string', adapter);
        await saveValue('ProductCode', store.product, 'string', adapter);

        if (store.reachable && store.device) {
            await saveValue('info.connection', true, 'boolean', adapter);
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
