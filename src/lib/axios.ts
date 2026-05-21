import axios from 'axios';
import https from 'https';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';
import { isApiSuccess } from './utils';

const insecureHttpsAgent = new https.Agent({ rejectUnauthorized: false });
let insecureTlsWarningShown = false;

const parseBooleanEnv = (value: string | undefined): boolean =>
    value === '1' || value === 'true' || value === 'yes' || value === 'on';

const getInsecureTlsHostAllowlist = (): string[] =>
    (process.env.MIDAS_AQUATEMP_INSECURE_TLS_HOSTS ?? '')
        .split(',')
        .map(host => host.trim().toLowerCase())
        .filter(Boolean);

const isInsecureTlsEnabled = (adapter: MidasAquatemp): boolean =>
    adapter.config.allowInsecureTls === true || parseBooleanEnv(process.env.MIDAS_AQUATEMP_INSECURE_TLS);

const canUseInsecureTlsForUrl = (url: string): boolean => {
    const allowlist = getInsecureTlsHostAllowlist();
    if (allowlist.length === 0) {
        return true;
    }

    try {
        const { hostname } = new URL(url);
        return allowlist.includes(hostname.toLowerCase());
    } catch {
        return false;
    }
};

const getHttpsAgent = (adapter: MidasAquatemp, url: string): https.Agent | undefined => {
    if (!isInsecureTlsEnabled(adapter)) {
        return undefined;
    }

    if (!canUseInsecureTlsForUrl(url)) {
        return undefined;
    }

    if (!insecureTlsWarningShown) {
        adapter.log.warn(
            'Insecure TLS mode is enabled (certificate verification disabled). Use only for trusted endpoints.',
        );
        insecureTlsWarningShown = true;
    }

    return insecureHttpsAgent;
};

export const request = async <T extends { error_code?: string | number }>(
    adapter: MidasAquatemp,
    url: string,
    options: unknown,
    header: { headers?: Record<string, string> } = {},
): Promise<{ status?: number; data: T | undefined; error: boolean }> => {
    try {
        const result = await axios.post<T>(url, options, {
            ...header,
            headers: {
                'Content-Type': 'application/json',
                ...header.headers,
            },
            httpsAgent: getHttpsAgent(adapter, url),
        });

        if (result.status !== 200) {
            return { error: true, status: result.status, data: result.data };
        }

        if (!isApiSuccess(result.data?.error_code)) {
            adapter.log.debug(`API error for ${url}: ${JSON.stringify(result.data)}`);
            return { error: true, status: result.status, data: result.data };
        }

        return { error: false, status: result.status, data: result.data };
    } catch (e) {
        errorLogger('Axios request error', e, adapter);
        return { status: 500, data: undefined, error: true };
    }
};
