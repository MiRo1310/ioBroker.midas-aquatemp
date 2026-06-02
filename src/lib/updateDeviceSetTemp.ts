import { getAxiosUpdateDeviceSetTempParams, getHeaders } from './axiosParameter';
import { getSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { errorLogger } from './logging';
import { request } from './axios';
import type { MidasData } from '../types/types';
import { isToken } from './utils';
import type { Store } from './store.ts';

export const updateDeviceSetTemp = async (store: Store, temperature: number): Promise<void> => {
    const { adapter, device } = store;
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

        if (!result?.val) {
            adapter.log.warn(`Invalid mode: ${result?.val}`);
            return;
        }

        if (String(result?.val) === '-1') {
            adapter.log.debug(`Mode set to: ${result?.val}`);
            return;
        }

        if (isToken(token) && device) {
            const { sURL } = getSUrl(store);

            const { data, error } = await request<MidasData>(
                adapter,
                sURL,
                getAxiosUpdateDeviceSetTempParams(device, sTemperature, store),
                getHeaders(token),
            );
            adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

            if (error) {
                await store.resetOnErrorHandler();
                return;
            }

            await saveValue({ key: 'tempSet', value: numericTemperature, stateType: 'number', store });
        }
    } catch (error: any) {
        errorLogger('Error in updateDeviceSetTemp', error, adapter);
    }
};
