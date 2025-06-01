import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';
import { request } from './axios';
import { getHeaders } from './axiosParameter';
import type { MidasData } from '../types/types';

export async function updateDeviceErrorMsg(adapter: MidasAquatemp): Promise<void> {
    const store = initStore();
    try {
        const { token, apiLevel, cloudURL, device: deviceCode } = store;
        if (!token) {
            return;
        }
        const sURL =
            apiLevel < 3
                ? `${cloudURL}/app/device/getFaultDataByDeviceCode.json`
                : `${cloudURL}/app/device/getFaultDataByDeviceCode`;

        const { data, error } = await request<MidasData>(
            adapter,
            sURL,
            {
                device_code: deviceCode,
                deviceCode: deviceCode,
            },
            getHeaders(token),
        );

        if (!data || error) {
            store.resetOnErrorHandler();
            return;
        }

        await saveValue({ key: 'error', value: true, stateType: 'boolean', adapter: adapter });
        await saveValue({
            key: 'errorMessage',
            value: data.objectResult?.[0]?.description ?? data.object_result?.[0]?.description ?? '',
            stateType: 'string',
            adapter: adapter,
        });
        await saveValue({
            key: 'errorCode',
            value: data.objectResult?.[0]?.faultCode ?? data.object_result?.[0]?.fault_code,
            stateType: 'string',
            adapter: adapter,
        });
        await saveValue({
            key: 'errorLevel',
            value: data.objectResult?.[0]?.errorLevel ?? data.object_result?.[0]?.error_level,
            stateType: 'string',
            adapter: adapter,
        });
    } catch (error: any) {
        errorLogger('Error in updateDeviceErrorMsg', error, adapter);
    }
}
