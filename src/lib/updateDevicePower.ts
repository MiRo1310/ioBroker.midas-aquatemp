import { getPowerMode } from './getSettings';
import { initStore } from './store';
import { getSUrl } from './endPoints';
import { getAxiosUpdateDevicePowerParams } from './axiosParameter';
import { saveValue } from './saveValue';
import axios from 'axios';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';

export async function updateDevicePower(adapter: MidasAquatemp, deviceCode: string, power: number): Promise<void> {
    const store = initStore();
    try {
        const token = store.token;
        const { powerMode, powerOpt } = getPowerMode(power);
        if (powerOpt === null || powerMode === null) {
            return;
        }
        if (token && token != '') {
            const { sURL } = getSUrl();
            const response = await axios.post(
                sURL,
                getAxiosUpdateDevicePowerParams({ deviceCode, value: powerOpt, protocolCode: 'Power' }),
                {
                    headers: { 'x-token': token },
                },
            );

            adapter.log.debug(`DeviceStatus: ${JSON.stringify(response.data)}`);
            if (parseInt(response.data.error_code) == 0) {
                await saveValue({ key: 'mode', value: power.toString(), stateType: 'string', adapter: adapter });
                if (power >= 0) {
                    await updateDeviceMode(adapter, store.device, power);
                }
                return;
            }
            adapter.log.error(`Error: ${JSON.stringify(response.data)}`);
            store.resetOnErrorHandler();
        }
    } catch (error: any) {
        errorLogger('Error in updateDevicePower', error, adapter);
    }
}

async function updateDeviceMode(adapter: MidasAquatemp, deviceCode: string, mode: any): Promise<void> {
    const store = initStore();
    const token = store.token;
    try {
        if (token && token != '') {
            const { sURL } = getSUrl();
            const response = await axios.post(
                sURL,
                getAxiosUpdateDevicePowerParams({ deviceCode: deviceCode, value: mode, protocolCode: 'mode' }),
                {
                    headers: { 'x-token': token },
                },
            );
            adapter.log.debug(`DeviceStatus: ${JSON.stringify(response.data)}`);

            if (parseInt(response.data.error_code) == 0) {
                await saveValue({ key: 'mode', value: mode, stateType: 'string', adapter: adapter });
                return;
            }
            adapter.log.error(`Error: ${JSON.stringify(response.data)}`);
            store.resetOnErrorHandler();
        }
    } catch (error: any) {
        errorLogger('Error in updateDeviceMode', error, adapter);
    }
}
