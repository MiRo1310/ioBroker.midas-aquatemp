import axios from "axios";
import { MidasAquatemp } from "../main";
import { getAxiosGetUpdateDeviceIdParams } from "./axiosParameter";
import { getUpdateDeviceIdSUrl } from "./endPoints";
import { saveValue } from "./saveValue";
import { initStore } from "./store";
import { updateDeviceStatus } from "./updateDeviceStatus";

let _this: MidasAquatemp;

export async function updateDeviceID(): Promise<void> {
	const store = initStore();
	try {
		if (!_this) {
			_this = MidasAquatemp.getInstance();
		}
		const { token, apiLevel } = store;
		if (!token) {
			return;
		}
		const { sURL } = getUpdateDeviceIdSUrl();

		const response = await axios.post(sURL, getAxiosGetUpdateDeviceIdParams(), {
			headers: { "x-token": token },
		});

		if (!response || response.status !== 200) {
			// Login-Fehler
			saveValue("info.connection", false, "boolean");
			return;
		}

		if (response.data.error_code !== "0") {
			// Login-Fehler
			saveValue("info.connection", false, "boolean");
			(store.token = ""), (store.device = ""), (store.reachable = false);
			return;
		}

		if (apiLevel < 3) {
			store.device = response.data.object_result[0].device_code;
			store.product = response.data.object_result[0].product_id;
			store.reachable = response.data.object_result[0].device_status == "ONLINE";
		} else {
			store.device = response.data.objectResult[0].deviceCode;
			store.product = response.data.objectResult[0].productId;
			store.reachable = response.data.objectResult[0].deviceStatus == "ONLINE";
		}

		saveValue("DeviceCode", store.device, "string");
		saveValue("ProductCode", store.product, "string");

		if (store.reachable && store.device) {
			saveValue("info.connection", true, "boolean");
			if (store.device != "" && store.product) {
				await updateDeviceStatus();
			}
			return;
		}
		// offline
		store.device = "";
		saveValue("info.connection", false, "boolean");
	} catch (error: any) {
		_this.log.error("Error in updateDeviceID(): " + JSON.stringify(error));
		_this.log.error("Error in updateDeviceID(): " + JSON.stringify(error.stack));
		(store.token = ""), (store.device = ""), (store.reachable = false);
	}
}
