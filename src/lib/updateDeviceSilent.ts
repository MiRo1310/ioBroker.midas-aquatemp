import { getAxiosUpdateDevicePowerParams, getHeaders } from './axiosParameter';
import { getSUrl } from './endPoints';
import { errorLogger } from './logging';
import { request } from './axios';
import type { MidasData } from '../types/types';
import type { Store } from './store';

export async function updateDeviceSilent(store: Store, silent: boolean): Promise<void> {
    const { adapter, device } = store;
    try {
        const token = store.token;
        const silentMode = silent ? '1' : '0';

        if (token && token != '' && device) {
            const { data, error } = await request<MidasData>(
                adapter,
                getSUrl(store).sURL,
                getAxiosUpdateDevicePowerParams(store, device, silentMode, 'Manual-mute'),
                getHeaders(token),
            );
            if (!data || error) {
                await store.resetOnErrorHandler();
                return;
            }

            adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

            await store.saveValue('silent', silent);
        }
    } catch (error: any) {
        errorLogger('Error in updateDeviceSilent', error, adapter);
    }
}
