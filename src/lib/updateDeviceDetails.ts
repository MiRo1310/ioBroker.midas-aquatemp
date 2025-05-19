import axios from 'axios';
import type { Modes } from '../types';
import { getProtocolCodes } from './axiosParameter';
import { getSUrlUpdateDeviceId } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';

export const numberToBoolean = (value: number): boolean => {
    return value === 1;
};

const saveValues = async (value: any): Promise<void> => {
	// Stromverbrauch T07 x T14 in Watt
	await saveValue(
		"consumption",
		parseFloat(findCodeVal(value, ["T07", "T7"])) * parseFloat(findCodeVal(value, "T14")),
		"number",
	);
	// Luftansaug-Temperatur T01
	await saveValue("suctionTemp", parseFloat(findCodeVal(value, ["T01", "T1"])), "number");
	// Inlet-Temperatur T02
	await saveValue("tempIn", parseFloat(findCodeVal(value, ["T02", "T2"])), "number");
	// outlet-Temperatur T03
	await saveValue("tempOut", parseFloat(findCodeVal(value, ["T03", "T3"])), "number");
	// Coil-Temperatur T04
	await saveValue("coilTemp", parseFloat(findCodeVal(value, ["T04", "T4"])), "number");
	// Umgebungs-Temperatur T05
	await saveValue("ambient", parseFloat(findCodeVal(value, ["T05", "T5"])), "number");
	// Kompressorausgang-Temperatur T06
	await saveValue("exhaust", parseFloat(findCodeVal(value, ["T06", "T6"])), "number");
	// Strömungsschalter S03
	await saveValue("flowSwitch", numberToBoolean(findCodeVal(value, ["S03", "S3"])), "boolean");
	// Lüfter-Drehzahl T17
	await saveValue("rotor", parseInt(findCodeVal(value, "T17")), "number");
};

export async function updateDeviceDetails(): Promise<void> {
    const store = initStore();
    try {
        const { apiLevel, token, device: deviceCode } = store;
        if (token) {
            const { sURL } = getSUrlUpdateDeviceId();

            const response = await axios.post(sURL, getProtocolCodes(deviceCode), {
                headers: { 'x-token': token },
            });
            store._this.log.debug(`DeviceDetails: ${JSON.stringify(response.data)}`);

            if (parseInt(response.data.error_code) == 0) {
                const responseValue = apiLevel < 3 ? response.data.object_result : response.data.objectResult;

				await saveValue("rawJSON", JSON.stringify(responseValue), "string");
				await saveValues(responseValue);

				const mode: number = findCodeVal(responseValue, "Mode");
				const modes: Modes = {
					1: "R02", // Heiz-Modus (-> R02)
					0: "R01", // Kühl-Modus (-> R01)
					2: "R03", // Auto-Modus (-> R03)
				};
				// Ziel-Temperatur anhand Modus
				await saveValue("tempSet", parseFloat(findCodeVal(responseValue, modes[mode])), "number");

				// Flüstermodus Manual-mute
				await saveValue("silent", findCodeVal(responseValue, "Manual-mute") == "1", "boolean");

				// Zustand Power
				if (findCodeVal(responseValue, "Power") == "1") {
					await saveValue("state", true, "boolean");
					await saveValue("mode", findCodeVal(responseValue, "Mode"), "string");
				} else {
					await saveValue("state", false, "boolean");
					await saveValue("mode", "-1", "string");
				}

				await saveValue("info.connection", true, "boolean");
				return;
			}

            store._this.log.error(`Error: ${JSON.stringify(response.data)}`);
            store.resetOnErrorHandler();
            return;
        }
        return;
    } catch (error: any) {
        store._this.log.error(JSON.stringify(error));
        store._this.log.error(JSON.stringify(error.stack));
    }
}

function findCodeVal(result: { value: string; code: string }[], code: string | string[]): any {
    if (!Array.isArray(code)) {
        return result.find(item => item.code === code)?.value || '';
    }
    for (let i = 0; i < code.length; i++) {
        const val = result.find(item => item.code === code[i])?.value;
        if (val !== '0') {
            return val;
        }
    }
    return '0';
}
