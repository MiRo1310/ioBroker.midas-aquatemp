import axios from 'axios';
import { getOptionsAndSUrl } from './endPoints';
import { initStore as useStore } from './store';
import { updateDeviceID } from './updateDeviceId';
import { updateDeviceStatus } from './updateDeviceStatus';

async function getToken(): Promise<void> {
    const store = useStore();
    const _this = store._this;
    try {
        const { token, apiLevel } = store;

        if (!token) {
            _this.log.debug('Request token');
            const { sUrl, options } = getOptionsAndSUrl();

            const response = await axios.post(sUrl, options);
            if (!response) {
                _this.log.error('No response from server');
                return;
            }
            if (response.status == 200) {
                store.token =
                    apiLevel < 3
                        ? response.data?.object_result?.['x-token']
                        : (store.token = response.data?.objectResult?.['x-token']);
                if (store.token) {
                    _this.log.debug('Login ok! Token');
                } else {
                    _this.log.error(`Login-error: ${JSON.stringify(response.data)}`);
                }

                return;
            }

            _this.log.error(`Login-error: ${response.data}`);
            store.resetOnErrorHandler();
            return;
        }
    } catch (error) {
        _this.log.error(`Error in getToken(): ${JSON.stringify(error)}`);
    }
}

export const updateToken = async (): Promise<void> => {
    const store = useStore();
    try {
        await getToken();

        if (!store.token) {
            store.resetOnErrorHandler();
            return;
        }
        if (store.useDeviceMac) {
            await updateDeviceStatus();
            return;
        }
        await updateDeviceID();
        return;
    } catch (error: any) {
        store._this.log.error(`Error in updateToken(): ${JSON.stringify(error)}`);
        store._this.log.error(`Error in updateToken(): ${JSON.stringify(error.stack)}`);
    }
};
