import axios from "axios";
import { getOptionsAndSUrl } from "./endPoints";
import { saveValue } from "./saveValue";
import { initStore } from "./store";
import { updateDeviceID } from "./updateDeviceId";

async function getToken(): Promise<void> {
	const store = initStore();
	const _this = store._this;
	try {
		const { token, apiLevel } = store;

		if (!token) {
			_this.log.info("Request token");
			const { sUrl, options } = getOptionsAndSUrl();
			const response = await axios.post(sUrl, options);
			if (response.status == 200) {
				store.token =
					apiLevel < 3
						? (store.token = response.data?.object_result?.["x-token"])
						: (store.token = response.data?.objectResult?.["x-token"]);

				_this.log.info("Login ok! Token: " + store.token);
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
	const store = initStore();
	try {
		await getToken();

		if (store.token) {
			await updateDeviceID();
			return;
		}

		store.resetOnErrorHandler();
		saveValue("info.connection", false, "boolean");
		return;
	} catch (error: any) {
		store._this.log.error("Error in updateToken(): " + JSON.stringify(error));
		store._this.log.error("Error in updateToken(): " + JSON.stringify(error.stack));
	}
};
