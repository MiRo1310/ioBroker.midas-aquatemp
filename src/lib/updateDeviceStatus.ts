import axios from "axios";
import { saveValue } from "./saveValue";
import { useStore } from "./store";
import { updateDeviceDetails } from "./updateDeviceDetails";
import { updateDeviceErrorMsg } from "./updateDeviceOnError";
const store = useStore();
export async function updateDeviceStatus(): Promise<void> {
	const { apiLevel, token, device: deviceCode, cloudURL } = store;
	if (token) {
		let sURL = "";

		if (apiLevel < 3) {
			sURL = cloudURL + "/app/device/getDeviceStatus.json";
		} else {
			sURL = cloudURL + "/app/device/getDeviceStatus";
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
			if (apiLevel < 3) {
				if (response.data.object_result["is_fault"] == true) {
					// TODO: Fehlerbeschreibung abrufen
					//clearValues();
					saveValue("error", true, "boolean");
					updateDeviceDetails();

					updateDeviceErrorMsg();
				} else {
					// kein Fehler
					saveValue("error", false, "boolean");
					saveValue("errorMessage", "", "string");
					saveValue("errorCode", "", "string");
					saveValue("errorLevel", 0, "number");
					updateDeviceDetails();
				}
			} else {
				if (response.data.objectResult["is_fault"] == true) {
					// TODO: Fehlerbeschreibung abrufen
					//clearValues();
					saveValue("error", true, "boolean");
					updateDeviceDetails();
					updateDeviceErrorMsg();
				} else {
					// kein Fehler
					saveValue("error", false, "boolean");
					saveValue("errorMessage", "", "string");
					saveValue("errorCode", "", "string");
					saveValue("errorLevel", 0, "number");
					updateDeviceDetails();
				}
			}
		} else {
			// log("Fehler in updateDeviceStatus(): " + JSON.stringify(response.data), "error");

			saveValue("info.connection", false, "boolean");
		}
	}
	(store.token = ""), (store.device = ""), (store.reachable = false);
}
