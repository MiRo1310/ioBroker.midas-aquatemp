import axios from 'axios';
import https from 'node:https';
import type { Store } from './store';

export class ApiError extends Error {
    constructor(
        public readonly errorCode: string | number,
        url: string,
    ) {
        super(`API error ${errorCode} for ${url}`);
        this.name = 'ApiError';
    }
}

export class ResetError extends Error {
    readonly sendToSentry: boolean;

    constructor(message: string, options?: ErrorOptions & { sendToSentry?: boolean }) {
        super(message, options);
        this.name = 'ResetError';
        this.sendToSentry = options?.sendToSentry ?? true;
    }
}

export class ApiClient {
    private static insecureHttpsAgent = new https.Agent({ rejectUnauthorized: false });
    private static readonly DEFAULT_TIMEOUT = 10 * 1000;
    private insecureTlsWarningShown = false;

    constructor(private readonly store: Store) {}

    private isInsecureTlsEnabled(): boolean {
        return this.store.adapter.config.allowInsecureTls === true;
    }

    private getHttpsAgent(): https.Agent | undefined {
        if (!this.isInsecureTlsEnabled()) {
            return;
        }

        if (!this.insecureTlsWarningShown) {
            this.store.adapter.log.warn(
                'Insecure TLS mode is enabled (certificate verification disabled). Use only for trusted endpoints.',
            );
            this.insecureTlsWarningShown = true;
        }

        return ApiClient.insecureHttpsAgent;
    }

    public async request<T extends { error_code?: string | number }>(
        url: string,
        data: unknown,
        token?: string | null,
    ): Promise<T> {
        const tokenHeader = token ? { 'x-token': token } : {};

        const result = await axios.post<T>(url, data, {
            headers: {
                'Content-Type': 'application/json',
                ...tokenHeader,
            },
            httpsAgent: this.getHttpsAgent(),
            timeout: ApiClient.DEFAULT_TIMEOUT,
        });

        if (result.status !== 200) {
            throw new Error(`HTTP error ${result.status} for ${url}`);
        }

        if (!result.data) {
            throw new Error('No response returned');
        }

        if (!ApiClient.isApiSuccess(result.data?.error_code)) {
            this.store.adapter.log.warn(
                `API error ${result.data?.error_code} for ${url}: ${JSON.stringify(result.data)}`,
            );
            throw new ApiError(result.data?.error_code ?? 'unknown', url);
        }

        return result.data;
    }

    public static isApiSuccess(errorCode?: string | number): boolean {
        return errorCode === undefined || errorCode === null || parseInt(String(errorCode), 10) === 0;
    }
}
