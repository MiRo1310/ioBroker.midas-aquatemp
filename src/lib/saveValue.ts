import { MidasAquatemp } from '../main';
import { initStore } from './store';
let _this: MidasAquatemp;

export const saveValue = async (
    key: string,
    value: ioBroker.StateValue,
    stateType: ioBroker.CommonType,
): Promise<void> => {
    const store = initStore();
    const dpRoot = store.getDpRoot();
    try {
        if (!_this) {
            _this = MidasAquatemp.getInstance();
        }
        const dp = `${dpRoot}.${key}`;

		if (!(await _this.objectExists(dp))) {
			await _this.setObjectNotExists(dp, {
				type: "state",
				common: {
					name: key,
					type: stateType,
					role: "value",
					read: true,
					write: false,
				},
				native: {},
			});
		}

		await _this.setState(dp, value, true);
	} catch (err) {
		_this.log.error("Error in saveValue: " + err);
	}
};
