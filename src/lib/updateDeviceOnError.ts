import { saveValue } from './saveValue';
import { errorLogger } from './logging';
import { request } from './axios';
import { getHeaders } from './axiosParameter';
import type { MidasData } from '../types/types';
import type { Store } from './store.ts';

export async function updateDeviceErrorMsg(store: Store): Promise<void> {
    const { adapter } = store;
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
            await store.resetOnErrorHandler();
            return;
        }

        await saveValue({ key: 'error', value: true, stateType: 'boolean', store });
        await saveValue({
            key: 'errorMessage',
            value: data.objectResult?.[0]?.description ?? data.object_result?.[0]?.description ?? '',
            stateType: 'string',
            store,
        });
        await saveValue({
            key: 'errorCode',
            value: data.objectResult?.[0]?.faultCode ?? data.object_result?.[0]?.fault_code,
            stateType: 'string',
            store,
        });
        await saveValue({
            key: 'errorLevel',
            value: data.objectResult?.[0]?.errorLevel ?? data.object_result?.[0]?.error_level,
            stateType: 'number',
            store,
        });
    } catch (error: any) {
        errorLogger('Error in updateDeviceErrorMsg', error, adapter);
    }
}
