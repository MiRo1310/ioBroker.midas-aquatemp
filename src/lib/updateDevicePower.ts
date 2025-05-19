import { getPowerMode } from "./getSettings";
import { initStore } from "./store";
import { getSUrl } from "./endPoints";
import { getAxiosUpdateDevicePowerParams } from "./axiosParameter";
import { saveValue } from "./saveValue";
import axios from "axios";

export async function updateDevicePower(deviceCode: string, power: number): Promise<void> {
    const store = initStore();
    try {
        const token = store.token;
        const { powerMode, powerOpt } = getPowerMode(power);
        if (powerOpt === null || powerMode === null) {
            return;
        }
        if (token && token != '') {
            const { sURL } = getSUrl();
            const response = await axios.post(
                sURL,
                getAxiosUpdateDevicePowerParams({ deviceCode, value: powerOpt, protocolCode: 'Power' }),
                {
                    headers: { 'x-token': token },
                },
            );

			store._this.log.debug("DeviceStatus: " + JSON.stringify(response.data));
			if (parseInt(response.data.error_code) == 0) {
				await saveValue("mode", power.toString(), "string");
				if (power >= 0) await updateDeviceMode(store.device, power);
				return;
			}
			store._this.log.error("Error: " + JSON.stringify(response.data));
			store.resetOnErrorHandler();
		}
	} catch (error: any) {
		store._this.log.error(JSON.stringify(error));
		store._this.log.error(JSON.stringify(error.stack));
	}
}

async function updateDeviceMode(deviceCode: string, mode: any): Promise<void> {
    const store = initStore();
    const token = store.token;
    try {
        if (token && token != '') {
            const { sURL } = getSUrl();
            const response = await axios.post(
                sURL,
                getAxiosUpdateDevicePowerParams({ deviceCode: deviceCode, value: mode, protocolCode: 'mode' }),
                {
                    headers: { 'x-token': token },
                },
            );
            store._this.log.debug(`DeviceStatus: ${JSON.stringify(response.data)}`);

			if (parseInt(response.data.error_code) == 0) {
				await saveValue("mode", mode, "string");
				return;
			}
			store._this.log.error("Error: " + JSON.stringify(response.data));
			store.resetOnErrorHandler();
		}
	} catch (error: any) {
		store._this.log.error(JSON.stringify(error));
		store._this.log.error(JSON.stringify(error.stack));
	}
}
