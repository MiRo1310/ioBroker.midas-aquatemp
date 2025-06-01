import { getAxiosUpdateDeviceSetTempParams, getHeaders } from './axiosParameter';
import { getSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';
import { request } from './axios';
import type { MidasData } from '../types/types';
import { isToken } from './utils';

export const updateDeviceSetTemp = async (
    adapter: MidasAquatemp,
    deviceCode: string,
    temperature: number,
): Promise<void> => {
    const store = initStore();
    const dpRoot = store.getDpRoot();
    try {
        const token = store.token;
        const sTemperature = temperature.toString().replace(',', '.');
        const result = await adapter.getStateAsync(`${dpRoot}.mode`);
        if (!(result?.val || result?.val === 0)) {
            return;
        }

        if (isToken(token)) {
            const { sURL } = getSUrl();

            const { data, error } = await request<MidasData>(
                adapter,
                sURL,
                getAxiosUpdateDeviceSetTempParams({ deviceCode, sTemperature }),
                getHeaders(token),
            );
            adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

            if (error) {
                store.resetOnErrorHandler();
                return;
            }

            await saveValue({ key: 'tempSet', value: temperature, stateType: 'number', adapter: adapter });
        }
    } catch (error: any) {
        errorLogger('Error in updateDeviceSetTemp', error, adapter);
    }
};
