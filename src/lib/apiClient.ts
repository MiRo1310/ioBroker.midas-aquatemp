import axios from 'axios';
import https from 'https';
import type { Store } from './store';

export class ApiClient {
    private static insecureHttpsAgent = new https.Agent({ rejectUnauthorized: false });
    private insecureTlsWarningShown = false;
    constructor(private readonly store: Store) {}

    private parseBooleanEnv(value?: string): boolean {
        return value === '1' || value === 'true' || value === 'yes' || value === 'on';
    }

    private getInsecureTlsHostAllowlist(): string[] {
        return (process.env.MIDAS_AQUATEMP_INSECURE_TLS_HOSTS ?? '')
            .split(',')
            .map(host => host.trim().toLowerCase())
            .filter(Boolean);
    }

    private isInsecureTlsEnabled(): boolean {
        return (
            this.store.adapter.config.allowInsecureTls === true ||
            this.parseBooleanEnv(process.env.MIDAS_AQUATEMP_INSECURE_TLS)
        );
    }

    private canUseInsecureTlsForUrl(url: string): boolean {
        const allowlist = this.getInsecureTlsHostAllowlist();
        if (allowlist.length === 0) {
            return true;
        }

        try {
            const { hostname } = new URL(url);
            return allowlist.includes(hostname.toLowerCase());
        } catch {
            return false;
        }
    }

    private getHttpsAgent(url: string): https.Agent | undefined {
        if (!this.isInsecureTlsEnabled() || !this.canUseInsecureTlsForUrl(url)) {
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
        options: unknown,
        token?: string | null,
    ): Promise<T> {
        const tokenHeader = token ? { 'x-token': token } : {};

        const result = await axios.post<T>(url, options, {
            headers: {
                'Content-Type': 'application/json',
                ...tokenHeader,
            },
            httpsAgent: this.getHttpsAgent(url),
        });

        this.store.adapter.log.debug(`Status: ${result.status}`);

        if (result.status !== 200) {
            throw new Error(`HTTP error ${result.status} for ${url}`);
        }

        if (!result.data) {
            throw new Error('No response returned');
        }

        if (!ApiClient.isApiSuccess(result.data?.error_code)) {
            this.store.adapter.log.debug(`API error for ${url}: ${JSON.stringify(result.data)}`);
            throw new Error(`API error ${result.data?.error_code} for ${url}`);
        }

        return result.data;
    }

    public static isApiSuccess(errorCode?: string | number): boolean {
        return errorCode === undefined || errorCode === null || parseInt(String(errorCode), 10) === 0;
    }
}
