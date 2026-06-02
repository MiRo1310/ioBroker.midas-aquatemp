import { getPowerMode } from './getSettings';
import type { Store, TMode } from './store';
import { getSUrl } from './endPoints';
import { getAxiosUpdateDevicePowerParams, getHeaders } from './axiosParameter';
import { saveValue } from './saveValue';
import { errorLogger } from './logging';
import { request } from './axios';
import type { MidasData } from '../types/types';
import { isDefined, isToken } from './utils';

export async function updateDevicePower(store: Store, mode: TMode): Promise<void> {
    const { token, adapter, device } = store;
    try {
        const { powerMode, powerOpt } = getPowerMode(mode);

        if (!isDefined(powerOpt) || !isDefined(powerMode) || !store.device || !isToken(token) || !device) {
            return;
        }

        const { sURL } = getSUrl(store);
        const { data, error } = await request<MidasData>(
            adapter,
            sURL,
            getAxiosUpdateDevicePowerParams(store, device, powerOpt, 'Power'),
            getHeaders(token),
        );
        if (!data || error) {
            await store.resetOnErrorHandler();
            return;
        }
        adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

        if (mode >= 0) {
            store.setMode(mode);
            await updateDeviceMode(store, mode.toString());
        } else {
            await saveValue({ key: 'mode', value: mode.toString(), stateType: 'string', store });
        }
    } catch (error: any) {
        errorLogger('Error in updateDevicePower', error, adapter);
    }
}

async function updateDeviceMode(store: Store, mode: string): Promise<void> {
    const token = store.token;
    const { adapter, device } = store;
    try {
        if (token && token != '' && device) {
            const { sURL } = getSUrl(store);
            const { data, error } = await request<MidasData>(
                adapter,
                sURL,
                getAxiosUpdateDevicePowerParams(store, device, mode, 'Mode'),
                {
                    headers: { 'x-token': token },
                },
            );
            if (!data || error) {
                await store.resetOnErrorHandler();
                return;
            }
            adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

            await saveValue({ key: 'mode', value: mode, stateType: 'string', store });
        }
    } catch (error: any) {
        errorLogger('Error in updateDeviceMode', error, adapter);
    }
}
