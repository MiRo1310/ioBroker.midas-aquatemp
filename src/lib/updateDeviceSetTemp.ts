import axios from "axios";
import { getAxiosUpdateDeviceSetTempParams } from "./axiosParameter";
import { getSUrl } from "./endPoints";
import { saveValue } from "./saveValue";
import { initStore } from "./store";

export const updateDeviceSetTemp = async (deviceCode: string, temperature: number): Promise<void> => {
	const store = initStore();
	const dpRoot = store.getDpRoot();
	try {
		const token = store.token;
		const sTemperature = temperature.toString().replace(",", ".");
		const result = await store._this.getStateAsync(dpRoot + ".mode");
		if (!result || !result.val) {
			return;
		}
		let sMode = result.val;
		if (sMode == "-1") {
			//log("Gerät einschalten um Temperatur zu ändern!", 'warn');
			return;
		} else if (sMode == "0") {
			sMode = "R01"; // Kühlen
		} else if (sMode == "1") {
			sMode = "R02"; // Heizen
		} else if (sMode == "2") {
			sMode = "R03"; // Auto
		}

		if (token && token != "") {
			const { sURL } = getSUrl();

			const response = await axios.post(sURL, getAxiosUpdateDeviceSetTempParams({ deviceCode, sTemperature }), {
				headers: { "x-token": token },
			});
			store._this.log.info("DeviceStatus: " + JSON.stringify(response.data));

			if (parseInt(response.data.error_code) == 0) {
				saveValue("tempSet", temperature, "number");
				return;
			}
			store._this.log.error("Error: " + JSON.stringify(response.data));

			store.resetOnErrorHandler();
			saveValue("info.connection", false, "boolean");
		}
	} catch (error: any) {
		store._this.log.error(JSON.stringify(error));
	}
};
