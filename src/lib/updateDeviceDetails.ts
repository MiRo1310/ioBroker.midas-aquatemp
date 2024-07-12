import axios from "axios";
import { getProtocolCodes } from "./axiosParameter";
import { getSUrlUpdateDeviceId } from "./endPoints";
import { saveValue } from "./saveValue";
import { initStore } from "./store";



const isAuaTemp_Poolsana = (product: string): boolean | null => {
	const store = initStore();
	if (product == store.AQUATEMP_POOLSANA) {
		return true;
	} else if (product == store.AQUATEMP_OTHER1) {
		return false;
	}
	return null;
};

const saveValues = (value: any, product: string): void => {
	const isAquaTemp_Poolsana = isAuaTemp_Poolsana(product);
	if (isAquaTemp_Poolsana == null) {
		return;
	}
	// Stromverbrauch T07 x T14 in Watt
	saveValue(
		"consumption",
		parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T07" : "T7")) * parseFloat(findCodeVal(value, "T14")),
		"number",
	);
	// Luftansaug-Temperatur T01
	saveValue("suctionTemp", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T01" : "T1")), "number");
	// Inlet-Temperatur T02
	saveValue("tempIn", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T02" : "T2")), "number");
	// outlet-Temperatur T03
	saveValue("tempOut", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T03" : "T3")), "number");
	// Coil-Temperatur T04
	saveValue("coilTemp", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T04" : "T4")), "number");
	// Umgebungs-Temperatur T05
	saveValue("ambient", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T05" : "T5")), "number");
	// Kompressorausgang-Temperatur T06
	saveValue("exhaust", parseFloat(findCodeVal(value, isAquaTemp_Poolsana ? "T06" : "T6")), "number");

	// Lüfter-Drehzahl T17
	saveValue("rotor", parseInt(findCodeVal(value, "T17")), "number");
};

export async function updateDeviceDetails(): Promise<void> {
	const store = initStore();
	try {
		const { apiLevel, token, device: deviceCode, product } = store;
		if (token) {
			const { sURL } = getSUrlUpdateDeviceId();

			const response = await axios.post(sURL, getProtocolCodes(deviceCode), {
				headers: { "x-token": token },
			});
			store._this.log.info("DeviceDetails: " + JSON.stringify(response.data));

			if (parseInt(response.data.error_code) == 0) {
				let responseValue: any;
				if (apiLevel < 3) {
					responseValue = response.data.object_result;
				} else {
					responseValue = response.data.objectResult;
				}

				saveValue("rawJSON", JSON.stringify(responseValue), "string");

				if (findCodeVal(responseValue, "Power") == "1") {
					saveValues(responseValue, product);
				} else {
					saveValue("consumption", 0, "number");
					saveValue("rotor", 0, "number");
				}

				// Ziel-Temperatur Set_Temp
				//saveValue("tempSet", parseFloat(findCodeVal(body.object_result, "Set_Temp")), "number");

				// Ziel-Temperatur anhand Modus
				if (findCodeVal(responseValue, "Mode") == 1) {
					// Heiz-Modus (-> R02)
					saveValue("tempSet", parseFloat(findCodeVal(responseValue, "R02")), "number");
				} else if (findCodeVal(response.data.object_result, "Mode") == 0) {
					// Kühl-Modus (-> R01)
					saveValue("tempSet", parseFloat(findCodeVal(responseValue, "R01")), "number");
				} else if (findCodeVal(response.data.object_result, "Mode") == 2) {
					// Auto-Modus (-> R03)
					saveValue("tempSet", parseFloat(findCodeVal(responseValue, "R03")), "number");
				}

				// Flüstermodus Manual-mute
				if (findCodeVal(responseValue, "Manual-mute") == "1") {
					saveValue("silent", true, "boolean");
				} else {
					saveValue("silent", false, "boolean");
				}

				// Zustand Power
				if (findCodeVal(responseValue, "Power") == "1") {
					saveValue("state", true, "boolean");
					saveValue("mode", findCodeVal(responseValue, "Mode"), "string");
				} else {
					saveValue("state", false, "boolean");
					saveValue("mode", "-1", "string");
				}

				saveValue("info.connection", true, "boolean");
				return;
			}

			store._this.log.error("Error: " + JSON.stringify(response.data));
			saveValue("info.connection", false, "boolean");
			(store.token = ""), (store.device = ""), (store.reachable = false);
			return;
		}
		return;
	} catch (error: any) {
		store._this.log.error(JSON.stringify(error));
		store._this.log.error(JSON.stringify(error.stack));
	}
}

function findCodeVal(result: any, code: string): any {
	// printLog("Suche Wert " + code, 1);
	for (let i = 0; i < result.length; i++) {
		// printLog(result[i].code, 1);
		if (result[i].code.indexOf(code) >= 0) {
			// printLog("Wert gefunden: " + result[i].value, 1);
			return result[i].value;
		}
	}
	return "";
}
