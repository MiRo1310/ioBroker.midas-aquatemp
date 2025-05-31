import axios from 'axios';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';

export const request = async <T>(
    adapter: MidasAquatemp,
    url: string,
    options = {},
    header = { headers: {} },
): Promise<{ status?: number; data: T | undefined }> => {
    try {
        const result = await axios.post(url, options, header);
        if (result.status === 200) {
            adapter.log.debug(`Axios request successful: ${JSON.stringify(result.data)}`);
        }
        if (result.status === 504) {
            adapter.log.warn(`Axios request timed out: ${url}`);
        }
        return { status: result.status, data: result.data };
    } catch (e) {
        errorLogger('Axios request error', e, adapter);
        return { status: 500, data: undefined };
    }
};
