import axios from "axios";
import { MidasAquatemp } from "../main";
import { saveValue } from "./saveValue";
import { updateDeviceStatus } from "./updateDeviceStatus";
import { useStore } from "./store";
const store = useStore();
let _this: MidasAquatemp;

export async function updateDeviceID(): Promise<void> {
	if (!_this) {
		_this = MidasAquatemp.getInstance();
	}
	const { token, apiLevel, cloudURL } = store;

	if (token) {
		_this.log.info("Token: " + token);
		let sURL;
		if (apiLevel < 3) {
			sURL = cloudURL + "/app/device/deviceList.json";
		} else {
			sURL = cloudURL + "/app/device/deviceList";
		}
		const response = await axios.post(
			sURL,
			{
				productIds: [
					"1132174963097280512",
					"1245226668902080512",
					"1656269521923575808",
					"1663080854333558784",
					"1596427678569979904",
					"1674238226096406528",
					"1650063968998252544",
					"1668781858447085568",
					"1186904563333062656",
					"1158905952238313472",
					"1442284873216843776",
					"1732565142225256450",
					"1548963836789501952",
					"1669159229372477440",
					"1650758828508766208",
					"1664085465655808000",
				],
			},
			{
				headers: { "x-token": token },
			},
		);

		if (response && response.status == 200) {
			// printLog("DeviceList: " + JSON.stringify(response.data));
			if (response.data.error_code == 0) {
				if (apiLevel < 3) {
					store.device = response.data.object_result[0].device_code;
					store.product = response.data.object_result[0].product_id;
					store.reachable = response.data.object_result[0].device_status == "ONLINE";
				} else {
					store.device = response.data.objectResult[0].deviceCode;
					store.product = response.data.objectResult[0].productId;
					store.reachable = response.data.objectResult[0].deviceStatus == "ONLINE";
				}

				// printLog("DeviceCode: " + device + ", ProductID: " + product + ", DeviceStatus: " + reachable);
				saveValue("DeviceCode", store.device, "string");
				saveValue("ProductCode", store.product, "string");

				if (store.reachable && store.device) {
					saveValue("info.connection", true, "boolean");
					if (store.device != "" && store.product) {
						await updateDeviceStatus();
					}
				} else {
					// offline
					store.device = "";
					saveValue("info.connection", false, "boolean");
				}
			} else {
				// Login-Fehler
				// log("Fehler in updateDeviceID(): " + JSON.stringify(response.data), "error");

				saveValue("info.connection", false, "boolean");

				(store.token = ""), (store.device = ""), (store.reachable = false);
			}
		}
		// Login-Fehler
		// log("Fehler in updateDeviceID(): " + JSON.stringify(response.data), "error");

		saveValue("info.connection", false, "boolean");
	}
	(store.token = ""), (store.device = ""), (store.reachable = false);
}
