import axios from 'axios';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';

export async function updateDeviceErrorMsg(adapter: MidasAquatemp): Promise<void> {
    const store = initStore();
    try {
        const { token, apiLevel, cloudURL, device: deviceCode } = store;
        if (token) {
            const sURL =
                apiLevel < 3
                    ? `${cloudURL}/app/device/getFaultDataByDeviceCode.json`
                    : `${cloudURL}/app/device/getFaultDataByDeviceCode`;

            const response = await axios.post(
                sURL,
                {
                    device_code: deviceCode,
                    deviceCode: deviceCode,
                },
                {
                    headers: { 'x-token': token },
                },
            );

            if (parseInt(response.data.error_code) == 0) {
                await saveValue('error', true, 'boolean', adapter);

                if (apiLevel < 3) {
                    await saveValue(
                        'errorMessage',
                        response.data.object_result[0]?.description ?? '',
                        'string',
                        adapter,
                    );
                    await saveValue('errorCode', response.data.object_result[0]?.fault_code, 'string', adapter);
                    await saveValue('errorLevel', response.data.object_result[0]?.error_level, 'string', adapter);
                    return;
                }
                await saveValue('errorMessage', response.data.objectResult[0]?.description ?? '', 'string', adapter);
                await saveValue('errorCode', response.data.objectResult[0]?.fault_code, 'string', adapter);
                await saveValue('errorLevel', response.data.objectResult[0]?.error_level, 'string', adapter);
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
