import { getPowerMode } from './getSettings';
import { initStore } from './store';
import { getSUrl } from './endPoints';
import { getAxiosUpdateDevicePowerParams, getHeaders } from './axiosParameter';
import { saveValue } from './saveValue';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';
import { request } from './axios';
import type { MidasData } from '../types/types';
import { isDefined, isToken } from './utils';

export async function updateDevicePower(adapter: MidasAquatemp, deviceCode: string, power: number): Promise<void> {
    const store = initStore();
    try {
        const token = store.token;
        const { powerMode, powerOpt } = getPowerMode(power);

        if (!isDefined(powerOpt) || !isDefined(powerMode) || !store.device || !isToken(token)) {
            return;
        }

        const { sURL } = getSUrl();
        const { data, error } = await request<MidasData>(
            adapter,
            sURL,
            getAxiosUpdateDevicePowerParams({ deviceCode, value: powerOpt, protocolCode: 'Power' }),
            getHeaders(token),
        );
        if (!data || error) {
            store.resetOnErrorHandler();
            return;
        }
        adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

        await saveValue({ key: 'mode', value: power.toString(), stateType: 'string', adapter: adapter });
        if (power >= 0) {
            await updateDeviceMode(adapter, store.device, power);
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
            const { data, error } = await request<MidasData>(
                adapter,
                sURL,
                getAxiosUpdateDevicePowerParams({ deviceCode: deviceCode, value: mode, protocolCode: 'mode' }),
                {
                    headers: { 'x-token': token },
                },
            );
            if (!data || error) {
                store.resetOnErrorHandler();
                return;
            }
            adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

            await saveValue({ key: 'mode', value: mode, stateType: 'string', adapter: adapter });
        }
    } catch (error: any) {
        errorLogger('Error in updateDeviceMode', error, adapter);
    }
}
