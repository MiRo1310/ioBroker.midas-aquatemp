import { errorLogger } from './logging';
import { request } from './axios';
import { getHeaders } from './axiosParameter';
import type { MidasData } from '../types/types';
import type { Store } from './store';

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

        await store.saveValue('error', true);
        await store.saveValue(
            'errorMessage',
            data.objectResult?.[0]?.description ?? data.object_result?.[0]?.description ?? '',
        );
        await store.saveValue('errorCode', data.objectResult?.[0]?.faultCode ?? data.object_result?.[0]?.fault_code);
        await store.saveValue('errorLevel', data.objectResult?.[0]?.errorLevel ?? data.object_result?.[0]?.error_level);
    } catch (error: any) {
        errorLogger('Error in updateDeviceErrorMsg', error, adapter);
    }
}
