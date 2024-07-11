import axios from "axios";
import { getOptionsAnsSUrl } from "./endPoints";
import { useStore } from "./store";
import { updateDeviceID } from "./updateDeviceId";

const store = useStore();

async function getToken(): Promise<void> {
	const _this = store._this;
	try {
		const { token, apiLevel } = store;

		if (!token) {
			_this.log.info("Request token");

			const { sUrl, options } = getOptionsAnsSUrl();

			const response = await axios.post(sUrl, options);

			if (response.status == 200) {
				if (apiLevel < 3) {
					store.token = response.data?.object_result?.["x-token"];
				} else {
					store.token = response.data?.objectResult?.["x-token"];
				}
				_this.log.info("Login ok! Token: " + token);
				return;
			}

			_this.log.error("Login-error: " + response.data);
			store.token = null;
			return;
		}
		return;
	} catch (error) {
		_this.log.error("Error in getToken(): " + JSON.stringify(error));
	}
}

export const updateToken = async (): Promise<void> => {
	try {
		await getToken();

		if (store.token) {
			await updateDeviceID();
			return;
		}

		store.resetOnErrorHandler();
		return;
	} catch (error: any) {
		store._this.log.error("Error in updateToken(): " + JSON.stringify(error));
		store._this.log.error("Error in updateToken(): " + JSON.stringify(error.stack));
	}
};
