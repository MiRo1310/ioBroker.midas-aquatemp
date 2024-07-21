import axios from "axios";
import { saveValue } from "./saveValue";
import { initStore } from "./store";

export async function updateDeviceErrorMsg(): Promise<void> {
	const store = initStore();
	try {
		const { token, apiLevel, cloudURL, device: deviceCode } = store;
		if (token) {
			let sURL = "";

			if (apiLevel < 3) {
				sURL = cloudURL + "/app/device/getFaultDataByDeviceCode.json";
			} else {
				sURL = cloudURL + "/app/device/getFaultDataByDeviceCode";
			}

			const response = await axios.post(
				sURL,
				{
					device_code: deviceCode,
					deviceCode: deviceCode,
				},
				{
					headers: { "x-token": token },
				},
			);

			if (parseInt(response.data.error_code) == 0) {
				saveValue("error", true, "boolean");

				if (apiLevel < 3) {
					saveValue("errorMessage", response.data.object_result[0].description, "string");
					saveValue("errorCode", response.data.object_result[0].fault_code, "string");
					saveValue("errorLevel", response.data.object_result[0].error_level, "string");
				} else {
					saveValue("errorMessage", response.data.objectResult[0].description, "string");
					saveValue("errorCode", response.data.objectResult[0].fault_code, "string");
					saveValue("errorLevel", response.data.objectResult[0].error_level, "string");
				}
				return;
			}
			// Login-Fehler
			(store.token = ""),
				// , (store.device = "")
				(store.reachable = false);
			saveValue("info.connection", false, "boolean");
			return;
		}
		return;
	} catch (error: any) {
		store._this.log.error(JSON.stringify(error));
		store._this.log.error(JSON.stringify(error.stack));
	}
}
