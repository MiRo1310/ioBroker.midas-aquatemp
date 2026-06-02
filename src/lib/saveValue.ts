import { errorLogger } from './logging';
import type { Store } from './store';

export const saveValue = async ({
    key,
    value,
    stateType,
    store,
}: {
    key: string;
    value?: ioBroker.StateValue;
    stateType: ioBroker.CommonType;
    store: Store;
}): Promise<void> => {
    const { adapter } = store;
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
        await adapter.setState(dp, value ?? null, true);
    } catch (err: any) {
        errorLogger('Error in saveValue', err, adapter);
    }
};
