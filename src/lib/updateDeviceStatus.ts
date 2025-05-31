import type { MidasAquatemp } from '../main';
import { getUpdateDeviceStatusSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { updateDeviceDetails } from './updateDeviceDetails';
import { updateDeviceErrorMsg } from './updateDeviceOnError';
import { errorLogger } from './logging';
import { request } from './axios';

export async function updateDeviceStatus(adapter: MidasAquatemp): Promise<void> {
    const store = initStore();
    try {
        const { token, device: deviceCode, apiLevel } = store;
        if (token) {
            const { sURL } = getUpdateDeviceStatusSUrl();

            const response = await request(
                adapter,
                sURL,
                {
                    device_code: deviceCode,
                    deviceCode: deviceCode,
                },
                {
                    headers: { 'x-token': token },
                },
            );
            if (!response?.data) {
                return;
            }
            {
                store.reachable =
                    apiLevel < 3
                        ? response.data.object_result?.[0]?.device_status == 'ONLINE'
                        : response.data.objectResult?.[0]?.deviceStatus == 'ONLINE';
            }

            if (parseInt(response.data.error_code) == 0) {
                adapter.log.debug(`DeviceStatus: ${JSON.stringify(response.data)}`);

                if (response.data?.object_result?.is_fault || response?.data?.objectResult?.isFault) {
                    adapter.log.error(`Error in updateDeviceStatus(): ${JSON.stringify(response.data)}`);
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
