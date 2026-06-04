import type { Store } from './store';
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
        const { logger } = this.store;
        try {
            if (this.isValidToken()) {
                return;
            }

            logger.debug('Request token');
            const { sUrl, options } = this.store.getOptionsAndSUrl();

            const data = await this.apiClient.request<RequestToken>(sUrl, options);

            const token = data?.object_result?.['x-token'] ?? data?.objectResult?.['x-token'] ?? null;

            this.token = token;

            if (token) {
                logger.debug('Login ok! Token');
            } else {
                logger.error(`Login-error: ${JSON.stringify(data)}`);
                await this.store.resetOnError();
            }
        } catch (error) {
            await this.store.resetAndHandleErrorWithSentry('Error in getToken', error);
        }
    }

    public updateToken = async (): Promise<void> => {
        try {
            await this.fetchToken();

            if (!this.isValidToken()) {
                return;
            }
            if (!this.deviceController) {
                this.store.logger.debug('DeviceController not set');
                return;
            }
            if (this.store.useDeviceMac) {
                await this.deviceController.updateDeviceStatus();
                return;
            }
            await this.deviceController.updateDeviceID();
        } catch (error: any) {
            await this.store.resetAndHandleErrorWithSentry('Error in updateToken', error);
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
