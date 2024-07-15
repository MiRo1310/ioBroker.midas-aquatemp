import axios from "axios";
import { getUpdateDeviceStatusSUrl } from "./endPoints";
import { saveValue } from "./saveValue";
import { initStore } from "./store";
import { updateDeviceDetails } from "./updateDeviceDetails";
import { updateDeviceErrorMsg } from "./updateDeviceOnError";

export async function updateDeviceStatus(): Promise<void> {

	const store = initStore();
	try {
		const { token, device: deviceCode } = store;
		if (token) {
			const { sURL } = getUpdateDeviceStatusSUrl();

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
				if (response.data?.object_result?.["is_fault"] || response.data?.objectResult?.["isFault"]) {
					// TODO: Fehlerbeschreibung abrufen
					//clearValues();
					saveValue("error", true, "boolean");
					updateDeviceDetails();
					updateDeviceErrorMsg();
					return;
				}
				// kein Fehler
				saveValue("error", false, "boolean");
				saveValue("errorMessage", "", "string");
				saveValue("errorCode", "", "string");
				saveValue("errorLevel", 0, "number");
				updateDeviceDetails();

				return;
			}
			saveValue("info.connection", false, "boolean");
			return;
		}
		(store.token = ""), (store.device = ""), (store.reachable = false);
	} catch (error: any) {
		store._this.log.error(JSON.stringify(error));
		store._this.log.error(JSON.stringify(error.stack));
	}

}
