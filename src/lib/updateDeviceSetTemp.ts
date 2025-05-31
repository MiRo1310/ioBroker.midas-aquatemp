import axios from 'axios';
import { getAxiosUpdateDeviceSetTempParams } from './axiosParameter';
import { getSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';

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
        if (!(result && (result.val || result.val === 0))) {
            return;
        }

        if (token && token != '') {
            const { sURL } = getSUrl();

            const response = await axios.post(sURL, getAxiosUpdateDeviceSetTempParams({ deviceCode, sTemperature }), {
                headers: { 'x-token': token },
            });
            adapter.log.debug(`DeviceStatus: ${JSON.stringify(response.data)}`);

            if (parseInt(response.data.error_code) == 0) {
                await saveValue({ key: 'tempSet', value: temperature, stateType: 'number', adapter: adapter });
                return;
            }
            adapter.log.error(`Error: ${JSON.stringify(response.data)}`);

            store.resetOnErrorHandler();
        }
    } catch (error: any) {
        errorLogger('Error in updateDeviceSetTemp', error, adapter);
    }
};
