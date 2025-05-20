import axios from 'axios';
import { MidasAquatemp } from '../main';
import { getUpdateDeviceStatusSUrl } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { updateDeviceDetails } from './updateDeviceDetails';
import { updateDeviceErrorMsg } from './updateDeviceOnError';
import { errorLogger } from './logging';

let _this: MidasAquatemp;

export async function updateDeviceStatus(): Promise<void> {
    const store = initStore();
    try {
        if (!_this) {
            _this = MidasAquatemp.getInstance();
        }
        const { token, device: deviceCode, apiLevel } = store;
        if (token) {
            const { sURL } = getUpdateDeviceStatusSUrl();

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

            store.reachable =
                apiLevel < 3
                    ? response.data.object_result[0]?.device_status == 'ONLINE'
                    : response.data.objectResult[0]?.deviceStatus == 'ONLINE';

            if (parseInt(response.data.error_code) == 0) {
                if (response.data?.object_result?.is_fault || response.data?.objectResult?.isFault) {
                    store._this.log.error(`Error in updateDeviceStatus(): ${JSON.stringify(response.data)}`);
                    // TODO: Fehlerbeschreibung abrufen
                    //clearValues();
                    await saveValue('error', true, 'boolean');
                    await updateDeviceDetails();
                    await updateDeviceErrorMsg();
                    return;
                }
                // kein Fehler
                await saveValue('error', false, 'boolean');
                await saveValue('errorMessage', '', 'string');
                await saveValue('errorCode', '', 'string');
                await saveValue('errorLevel', 0, 'number');
                await updateDeviceDetails();

                return;
            }
            store.resetOnErrorHandler();
            return;
        }
        store.resetOnErrorHandler();
    } catch (error: any) {
        errorLogger('Error in updateDeviceStatus', error, store._this);
    }
}
