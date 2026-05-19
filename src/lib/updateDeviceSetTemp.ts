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
        const numericTemperature =
            typeof temperature === 'number' ? temperature : parseFloat(String(temperature).replace(',', '.'));
        if (!Number.isFinite(numericTemperature)) {
            adapter.log.warn(`Invalid set temperature: ${temperature}`);
            return;
        }
        const sTemperature = numericTemperature.toString().replace(',', '.');
        const result = await adapter.getStateAsync(`${dpRoot}.mode`);
        if (String(result?.val) === '-1') {
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

            await saveValue({ key: 'tempSet', value: numericTemperature, stateType: 'number', adapter: adapter });
        }
    } catch (error: any) {
        errorLogger('Error in updateDeviceSetTemp', error, adapter);
    }
};
