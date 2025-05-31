import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';
import { request } from './axios';
import { getHeaders } from './axiosParameter';

export async function updateDeviceErrorMsg(adapter: MidasAquatemp): Promise<void> {
    const store = initStore();
    try {
        const { token, apiLevel, cloudURL, device: deviceCode } = store;
        if (token) {
            const sURL =
                apiLevel < 3
                    ? `${cloudURL}/app/device/getFaultDataByDeviceCode.json`
                    : `${cloudURL}/app/device/getFaultDataByDeviceCode`;

            const { data } = await request(
                adapter,
                sURL,
                {
                    device_code: deviceCode,
                    deviceCode: deviceCode,
                },
                getHeaders(token),
            );
            if (!data) {
                return;
            }

            if (data.error_code === '0') {
                await saveValue({ key: 'error', value: true, stateType: 'boolean', adapter: adapter });

                if (apiLevel < 3) {
                    await saveValue({
                        key: 'errorMessage',
                        value: data.object_result?.[0]?.description ?? '',
                        stateType: 'string',
                        adapter: adapter,
                    });
                    await saveValue({
                        key: 'errorCode',
                        value: data.object_result?.[0]?.fault_code,
                        stateType: 'string',
                        adapter: adapter,
                    });
                    await saveValue({
                        key: 'errorLevel',
                        value: data.object_result?.[0]?.error_level,
                        stateType: 'string',
                        adapter: adapter,
                    });
                    return;
                }
                await saveValue({
                    key: 'errorMessage',
                    value: data.objectResult?.[0]?.description ?? '',
                    stateType: 'string',
                    adapter: adapter,
                });
                await saveValue({
                    key: 'errorCode',
                    value: data.objectResult?.[0]?.faultCode,
                    stateType: 'string',
                    adapter: adapter,
                });
                await saveValue({
                    key: 'errorLevel',
                    value: data.objectResult?.[0]?.errorLevel,
                    stateType: 'string',
                    adapter: adapter,
                });
                return;
            }
            // Login-Fehler
            store.resetOnErrorHandler();
            return;
        }
        return;
    } catch (error: any) {
        errorLogger('Error in updateDeviceErrorMsg', error, adapter);
    }
}
