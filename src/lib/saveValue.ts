import type { MidasAquatemp } from '../main';
import { initStore } from './store';
import { errorLogger } from './logging';

export const saveValue = async (
    key: string,
    value: ioBroker.StateValue,
    stateType: ioBroker.CommonType,
    adapter: MidasAquatemp,
): Promise<void> => {
    const store = initStore();
    const dpRoot = store.getDpRoot();
    try {
        const dp = `${dpRoot}.${key}`;

        if (!(await adapter.objectExists(dp))) {
            await adapter.setObjectNotExists(dp, {
                type: 'state',
                common: {
                    name: key,
                    type: stateType,
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });
        }
        if (value) {
            await adapter.setState(dp, value, true);
        }
    } catch (err: any) {
        errorLogger('Error in saveValue', err, adapter);
    }
};
