import { getAxiosUpdateDevicePowerParams, getHeaders } from './axiosParameter';
import { getSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';
import { request } from './axios';
import type { MidasData } from '../types/types';

export async function updateDeviceSilent(adapter: MidasAquatemp, deviceCode: string, silent: boolean): Promise<void> {
    const store = initStore();
    try {
        const token = store.token;
        const silentMode = silent ? '1' : '0';

        if (token && token != '') {
            const { data, error } = await request<MidasData>(
                adapter,
                getSUrl().sURL,
                getAxiosUpdateDevicePowerParams({ deviceCode, value: silentMode, protocolCode: 'Manual-mute' }),
                getHeaders(token),
            );
            if (!data || error) {
                store.resetOnErrorHandler();
                return;
            }

            adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

            await saveValue({ key: 'silent', value: silent, stateType: 'boolean', adapter: adapter });
        }
    } catch (error: any) {
        errorLogger('Error in updateDeviceSilent', error, adapter);
    }
}
