import { getOptionsAndSUrl } from './endPoints';
import type { Store } from './store';
import { errorLogger } from './logging';
import { request } from './axios';
import type { RequestToken } from '../types/types';
import { isDefined } from './utils';
import type { DeviceController } from './deviceController';

export class TokenManager {
    token: string | null = null;

    constructor(private store: Store) {
        store.setTokenManager(this);
    }

    public async fetchToken(): Promise<void> {
        const { adapter, resetOnErrorHandler } = this.store;
        try {
            if (this.isValidToken()) {
                return;
            }

            adapter.log.debug('Request token');
            const { sUrl, options } = getOptionsAndSUrl(this.store);

            const { data, error } = await request<RequestToken>(adapter, sUrl, options);

            if (error || !data) {
                adapter.log.error(`Login-error: ${JSON.stringify(data)}`);
                await resetOnErrorHandler();
                return;
            }
            const token = data?.object_result?.['x-token'] ?? data?.objectResult?.['x-token'] ?? null;

            this.token = token;

            if (token) {
                adapter.log.debug('Login ok! Token');
            } else {
                adapter.log.error(`Login-error: ${JSON.stringify(data)}`);
                await resetOnErrorHandler();
            }
        } catch (error) {
            errorLogger('Error in getToken', error, adapter);
        }
    }

    public updateToken = async (deviceController: DeviceController): Promise<void> => {
        const { adapter, useDeviceMac } = this.store;
        try {
            await this.fetchToken();

            if (!this.token) {
                return;
            }
            if (useDeviceMac) {
                await deviceController.updateDeviceStatus();
                return;
            }
            await deviceController.updateDeviceID();
        } catch (error: any) {
            errorLogger('Error in updateToken', error, adapter);
        }
    };

    public resetToken = (): void => {
        this.token = null;
    };

    public getValidTokenOrNull = (): string | null => {
        if (this.isValidToken()) {
            return this.token;
        }
        return null;
    };

    private isValidToken(): boolean {
        return isDefined(this.token) && this.token !== '';
    }
}
