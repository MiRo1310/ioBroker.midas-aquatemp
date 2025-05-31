import type { AxiosResponse } from 'axios';
// eslint-disable-next-line no-duplicate-imports
import axios from 'axios';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';

export const request = async (
    adapter: MidasAquatemp,
    url: string,
    options = {},
    header = { headers: {} },
): Promise<AxiosResponse | undefined> => {
    try {
        const result = await axios.post(url, options, header);
        if (result.status === 200) {
            adapter.log.debug(`Axios request successful: ${JSON.stringify(result.data)}`);
            return result;
        }
        if (result.status === 504) {
            adapter.log.warn(`Axios request timed out: ${url}`);
            return result;
        }
        return result;
    } catch (e) {
        errorLogger('Axios request error', e, adapter);
    }
};
