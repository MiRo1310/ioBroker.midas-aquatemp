import type { Store } from './store';
import { errorLogger } from './logging';
import type { RequestToken } from '../types/types';
import { isDefined } from './utils';
import type { DeviceController } from './deviceController';
import type { ApiClient } from './apiClient';

export class TokenManager {
    private token: string | null = null;
    private deviceController?: DeviceController;

    constructor(
        private store: Store,
        private apiClient: ApiClient,
    ) {
        store.setTokenManager(this);
    }

    public setDeviceController(deviceController: DeviceController): void {
        this.deviceController = deviceController;
    }

    public async fetchToken(): Promise<void> {
        const { adapter, resetOnErrorHandler } = this.store;
        try {
            if (this.isValidToken()) {
                return;
            }

            adapter.log.debug('Request token');
            const { sUrl, options } = this.store.getOptionsAndSUrl();

            const { data, error } = await this.apiClient.request<RequestToken>(sUrl, options);

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

    public updateToken = async (): Promise<void> => {
        const { adapter, useDeviceMac } = this.store;
        try {
            await this.fetchToken();

            if (!this.isValidToken()) {
                return;
            }
            if (!this.deviceController) {
                this.store.adapter.log.debug('DeviceController not set');
                return;
            }
            if (useDeviceMac) {
                await this.deviceController.updateDeviceStatus();
                return;
            }
            await this.deviceController.updateDeviceID();
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
        this.store.adapter.log.debug('No valid token available');
        return null;
    };

    private isValidToken(): boolean {
        return isDefined(this.token) && this.token !== '';
    }
}
