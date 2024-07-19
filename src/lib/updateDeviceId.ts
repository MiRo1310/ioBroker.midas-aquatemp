import axios from "axios";
import { MidasAquatemp } from "../main";
import { getAxiosUpdateDeviceIdParams } from "./axiosParameter";
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
		// const httpsAgent = new https.Agent({
		// 	rejectUnauthorized: false, // Achtung: Dies birgt Sicherheitsrisiken
		// });
		const options = getAxiosUpdateDeviceIdParams();
		_this.log.debug("UpdateDeviceID URL: " + sURL);
		_this.log.debug("UpdateDeviceID options: " + JSON.stringify(options));
		const response = await axios.post(sURL, options, {
			headers: { "x-token": token },
			// httpsAgent,
			// timeout: 5000,
		});

		_this.log.debug("UpdateDeviceID response: " + JSON.stringify(response.data));
		_this.log.debug("UpdateDeviceID response status: " + JSON.stringify(response.status));

		if (!response || response.status !== 200 || response.data.error_code !== "0") {
			// Login-Fehler
			store.resetOnErrorHandler();
			return;
		}

		if (!response.data?.object_result?.[0]?.device_code && !response.data?.objectResult?.[0]?.deviceCode) {
			_this.log.error("Error in updateDeviceID(): No device code found");
			_this.log.error("Response: " + JSON.stringify(response.data));
			return;
		}

		if (apiLevel < 3) {
			store.device = response.data.object_result[0]?.device_code;
			store.product = response.data.object_result[0]?.product_id;
			store.reachable = response.data.object_result[0]?.device_status == "ONLINE";
		} else {
			store.device = response.data.objectResult[0]?.deviceCode;
			store.product = response.data.objectResult[0]?.productId;
			store.reachable = response.data.objectResult[0]?.deviceStatus == "ONLINE";
		}
		_this.log.debug("Device: " + store.device);
		_this.log.debug("Product: " + store.product);
		_this.log.debug("Reachable: " + store.reachable);

		saveValue("DeviceCode", store.device, "string");
		saveValue("ProductCode", store.product, "string");

		if (store.reachable && store.device) {
			saveValue("info.connection", true, "boolean");
			if (store.device != "" && store.product) {
				_this.log.debug("Update device status");
				await updateDeviceStatus();
			}
			return;
		}
		_this.log.debug("Device not reachable");
		store.resetOnErrorHandler();
	} catch (error: any) {
		_this.log.error("Error in updateDeviceID(): " + JSON.stringify(error));
		_this.log.error("Error in updateDeviceID(): " + JSON.stringify(error.stack));
		(store.token = ""), (store.device = ""), (store.reachable = false);
	}
}
