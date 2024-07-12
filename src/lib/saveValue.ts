import { MidasAquatemp } from "../main";
import { initStore } from "./store";
let _this: MidasAquatemp;

export const saveValue = (key: string, value: ioBroker.StateValue, stateType: ioBroker.CommonType): void => {
	const store = initStore();
	const dpRoot = store.getDpRoot();
	if (!_this) {
		_this = MidasAquatemp.getInstance();
	}
	const dp = dpRoot + "." + key;

	if (!_this.objectExists(dp)) {
		_this.setObjectNotExists(dp, {
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
		return;
	}

	_this.setState(dp, value, true);
};
