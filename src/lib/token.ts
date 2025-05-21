import axios from 'axios';
import { getOptionsAndSUrl } from './endPoints';
import { initStore as useStore } from './store';
import { updateDeviceID } from './updateDeviceId';
import { updateDeviceStatus } from './updateDeviceStatus';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';

async function getToken(adapter: MidasAquatemp): Promise<void> {
    const store = useStore();

    try {
        const { token, apiLevel } = store;

        if (!token) {
            adapter.log.debug('Request token');
            const { sUrl, options } = getOptionsAndSUrl();

            const response = await axios.post(sUrl, options);
            if (!response) {
                adapter.log.error('No response from server');
                return;
            }
            if (response.status == 200) {
                store.token =
                    apiLevel < 3
                        ? response.data?.object_result?.['x-token']
                        : (store.token = response.data?.objectResult?.['x-token']);
                if (store.token) {
                    adapter.log.debug('Login ok! Token');
                } else {
                    adapter.log.error(`Login-error: ${JSON.stringify(response.data)}`);
                }

                return;
            }

            adapter.log.error(`Login-error: ${response.data}`);
            store.resetOnErrorHandler();
            return;
        }
    } catch (error) {
        errorLogger('Error in getToken', error, adapter);
    }
}

export const updateToken = async (adapter: MidasAquatemp): Promise<void> => {
    const store = useStore();
    try {
        await getToken(adapter);

        if (!store.token) {
            store.resetOnErrorHandler();
            return;
        }
        if (store.useDeviceMac) {
            await updateDeviceStatus(adapter);
            return;
        }
        await updateDeviceID(adapter);
        return;
    } catch (error: any) {
        errorLogger('Error in updateToken', error, adapter);
    }
};
