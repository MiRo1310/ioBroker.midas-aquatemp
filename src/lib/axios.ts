import axios from 'axios';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';

export const request = async <T>(
    adapter: MidasAquatemp,
    url: string,
    options = {},
    header = { headers: {} },
): Promise<{ status?: number; data: T | undefined; error: boolean }> => {
    try {
        const result = await axios.post(url, options, header);
        if (result.status === 200) {
            return { error: false, status: result.status, data: result.data as T };
        }

        return { error: true, status: result.status, data: result.data };
    } catch (e) {
        errorLogger('Axios request error', e, adapter);
        return { status: 500, data: undefined, error: true };
    }
};
