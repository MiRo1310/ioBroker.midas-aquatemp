import type { MidasAquatemp } from '../main';
import { getUpdateDeviceStatusSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { updateDeviceDetails } from './updateDeviceDetails';
import { updateDeviceErrorMsg } from './updateDeviceOnError';
import { errorLogger } from './logging';
import { request } from './axios';
import { getHeaders } from './axiosParameter';

export async function updateDeviceStatus(adapter: MidasAquatemp): Promise<void> {
    const store = initStore();
    try {
        const { token, device: deviceCode } = store;
        if (token) {
            const { sURL } = getUpdateDeviceStatusSUrl();

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
            {
                store.reachable =
                    (data.object_result?.[0]?.device_status ?? data.objectResult?.[0]?.deviceStatus) == 'ONLINE';
            }

            if (data.error_code == '0') {
                adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

                if (data?.object_result?.[0]?.is_fault || data?.objectResult?.[0]?.isFault) {
                    adapter.log.error(`Error in updateDeviceStatus(): ${JSON.stringify(data)}`);
                    // TODO: Fehlerbeschreibung abrufen
                    //clearValues();
                    await saveValue({ key: 'error', value: true, stateType: 'boolean', adapter: adapter });
                    await updateDeviceDetails(adapter);
                    await updateDeviceErrorMsg(adapter);
                    return;
                }
                // kein Fehler
                await saveValue({ key: 'error', value: false, stateType: 'boolean', adapter: adapter });
                await saveValue({ key: 'errorMessage', value: '', stateType: 'string', adapter: adapter });
                await saveValue({ key: 'errorCode', value: '', stateType: 'string', adapter: adapter });
                await saveValue({ key: 'errorLevel', value: 0, stateType: 'number', adapter: adapter });
                await updateDeviceDetails(adapter);

                return;
            }
            store.resetOnErrorHandler();
            return;
        }
        store.resetOnErrorHandler();
    } catch (error: any) {
        errorLogger('Error in updateDeviceStatus', error, adapter);
    }
}
