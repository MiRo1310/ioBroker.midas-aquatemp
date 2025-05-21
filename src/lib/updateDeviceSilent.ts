import axios from 'axios';
import { getAxiosUpdateDevicePowerParams } from './axiosParameter';
import { getSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';

export async function updateDeviceSilent(adapter: MidasAquatemp, deviceCode: string, silent: boolean): Promise<void> {
    const store = initStore();
    try {
        const token = store.token;
        const silentMode = silent ? '1' : '0';

        if (token && token != '') {
            const { sURL } = getSUrl();
            const response = await axios.post(
                sURL,
                getAxiosUpdateDevicePowerParams({ deviceCode, value: silentMode, protocolCode: 'Manual-mute' }),
                {
                    headers: { 'x-token': token },
                },
            );
            adapter.log.debug(`DeviceStatus: ${JSON.stringify(response.data)}`);

            if (parseInt(response.data.error_code) == 0) {
                await saveValue('silent', silent, 'boolean', adapter);
                return;
            }
            adapter.log.error(`Error: ${JSON.stringify(response.data)}`);
            store.resetOnErrorHandler();
        }
    } catch (error: any) {
        errorLogger('Error in updateDeviceSilent', error, adapter);
    }
}
