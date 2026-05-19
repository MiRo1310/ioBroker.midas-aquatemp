import axios from 'axios';
import https from 'https';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';
import { isApiSuccess } from './utils';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export const request = async <T extends { error_code?: string | number }>(
    adapter: MidasAquatemp,
    url: string,
    options: Record<string, unknown> = {},
    header: { headers?: Record<string, string> } = {},
): Promise<{ status?: number; data: T | undefined; error: boolean }> => {
    try {
        const result = await axios.post<T>(url, options, {
            ...header,
            headers: {
                'Content-Type': 'application/json',
                ...header.headers,
            },
            httpsAgent,
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
