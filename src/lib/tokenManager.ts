import type { Store } from './store';
import type { RequestToken } from '../types/types';
import { isDefined } from './utils';
import type { DeviceController } from './deviceController';
import type { ApiClient } from './apiClient';
import { ApiError, ResetError } from './apiClient';

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
        if (this.isValidToken()) {
            return;
        }
        try {
            await this.fetchToken();
        } catch (error) {
            throw new ResetError('GetToken', { cause: error, sendToSentry: !(error instanceof ApiError) });
        }
    }

    private async fetchToken(): Promise<void> {
        const { logger } = this.store;
        logger.debug('Requesting new authentication token');
        const { sUrl, options } = this.store.getOptionsAndSUrl();

        const data = await this.apiClient.request<RequestToken>(sUrl, options);

        const token = data?.object_result?.['x-token'] ?? data?.objectResult?.['x-token'] ?? null;

        this.token = token;

        if (token) {
            logger.info('Authentication successful');
        } else {
            logger.error(`Login failed: ${JSON.stringify(data)}`);
            await this.store.resetOnError();
        }
    }

    public async updateTokenAndDeviceId(): Promise<void> {
        try {
            await this.ensureValidToken();

            if (!this.isValidToken()) {
                return;
            }
            if (!this.deviceController) {
                this.store.logger.warn('DeviceController not set — cannot update device');
                return;
            }
            if (this.store.useDeviceMac) {
                await this.deviceController.updateDeviceStatus();
                return;
            }
            await this.deviceController.fetchDevice();
        } catch (error: any) {
            await this.store.resetAndHandleErrorWithSentry('Error in updateToken', error);
        }
    }

    public resetToken(): void {
        this.token = null;
    }

    public getValidTokenOrNull(): string | null {
        if (this.isValidToken()) {
            return this.token;
        }
        this.store.adapter.log.debug('No valid token available');
        return null;
    }

    private isValidToken(): boolean {
        return isDefined(this.token) && this.token !== '';
    }
}
