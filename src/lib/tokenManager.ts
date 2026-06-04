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

    public async ensureValidToken(): Promise<void> {
        try {
            if (this.isValidToken()) {
                return;
            }
            await this.fetchToken();
        } catch (error) {
            await this.store.resetAndHandleErrorWithSentry('Error in getToken', error);
        }
    }

    private async fetchToken(): Promise<void> {
        const { logger } = this.store;
        logger.debug('Request token');
        const { sUrl, options } = this.store.getOptionsAndSUrl();

        const data = await this.apiClient.request<RequestToken>(sUrl, options);

        const token = data?.object_result?.['x-token'] ?? data?.objectResult?.['x-token'] ?? null;

        this.token = token;

        if (token) {
            logger.debug('Login successfully!');
        } else {
            logger.error(`Login-error: ${JSON.stringify(data)}`);
            await this.store.resetOnError();
        }
    }

    public updateTokenAndDeviceId = async (): Promise<void> => {
        try {
            await this.ensureValidToken();

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
