import axios from 'axios';
import { getAxiosUpdateDeviceSetTempParams } from './axiosParameter';
import { getSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';

export const updateDeviceSetTemp = async (deviceCode: string, temperature: number): Promise<void> => {
    const store = initStore();
    const dpRoot = store.getDpRoot();
    try {
        const token = store.token;
        const sTemperature = temperature.toString().replace(',', '.');
        const result = await store._this.getStateAsync(`${dpRoot}.mode`);
        if (!(result && (result.val || result.val === 0))) {
            return;
        }

        if (token && token != '') {
            const { sURL } = getSUrl();

            const response = await axios.post(sURL, getAxiosUpdateDeviceSetTempParams({ deviceCode, sTemperature }), {
                headers: { 'x-token': token },
            });
            store._this.log.debug(`DeviceStatus: ${JSON.stringify(response.data)}`);

            if (parseInt(response.data.error_code) == 0) {
                await saveValue('tempSet', temperature, 'number');
                return;
            }
            store._this.log.error(`Error: ${JSON.stringify(response.data)}`);

            store.resetOnErrorHandler();
        }
    } catch (error: any) {
        errorLogger('Error in updateDeviceSetTemp', error, store._this);
    }
};
