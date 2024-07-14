import { getAxiosUpdateDevicePowerParams } from "./axiosParameter";
import { getSUrl } from "./endPoints";
import { saveValue } from "./saveValue";
import { initStore } from "./store";
import axios from "axios";

export async function updateDeviceSilent(deviceCode: string, silent: any): Promise<void> {
	const store = initStore();
	try {
		const token = store.token;
		let silentMode;

		if (silent) {
			silentMode = "1";
		} else {
			silentMode = "0";
		}

		if (token && token != "") {
			const { sURL } = getSUrl();
			const response = await axios.post(
				sURL,
				getAxiosUpdateDevicePowerParams({ deviceCode, value: silentMode, protocolCode: "Manual-mute" }),
				{
					headers: { "x-token": token },
				},
			);
			store._this.log.info("DeviceStatus: " + JSON.stringify(response.data));

			if (parseInt(response.data.error_code) == 0) {
				saveValue("silent", silent, "boolean");
				return;
			}
			store._this.log.error("Error: " + JSON.stringify(response.data));
			store.resetOnErrorHandler();
			saveValue("info.connection", false, "boolean");
		}
	} catch (error: any) {
		store._this.log.error(JSON.stringify(error));
		store._this.log.error(JSON.stringify(error.stack));
	}
}
