/*
 * Created with @iobroker/create-adapter v2.6.3
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an
import { initStore } from "./lib/store";

import * as utils from "@iobroker/adapter-core";
import { createObjects } from "./lib/createState";
import { encryptPassword } from "./lib/encryptPassword";
import { setupEndpoints } from "./lib/endPoints";
import { saveValue } from "./lib/saveValue";

import { updateToken } from "./lib/token";

import { updateDevicePower } from "./lib/updateDevicePower";
import { updateDeviceSetTemp } from "./lib/updateDeviceSetTemp";
import { updateDeviceSilent } from "./lib/updateDeviceSilent";

let updateIntervall: ioBroker.Interval | undefined;
let tokenRefreshTimer: ioBroker.Interval | undefined;

export class MidasAquatemp extends utils.Adapter {
	private static instance: MidasAquatemp;

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: "midas-aquatemp",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("unload", this.onUnload.bind(this));
		MidasAquatemp.instance = this;
	}
	public static getInstance(): MidasAquatemp {
		return MidasAquatemp.instance;
	}

	private async onReady(): Promise<void> {
		const store = initStore();
		store._this = this;
		store.instance = this.instance;

		const dpRoot = store.getDpRoot();
		this.setState("info.connection", false, true);

		store.username = this.config.username;
		const password = this.config.password;
		store.interval = this.config.refresh;
		store.apiLevel = this.config.selectApi;
		if (this.config.useDeviceMac) {
			store.device = this.config.deviceMac;
		}

		store.useDeviceMac = this.config.useDeviceMac;
		this.log.debug("API-Level: " + this.config.selectApi);

		setupEndpoints();


		encryptPassword(password);
		await createObjects();
		this.log.info("Objects created");
		clearValues();
		await updateToken();

		function clearValues(): void {
			saveValue("error", true, "boolean");
			saveValue("consumption", 0, "number");
			saveValue("state", false, "boolean");
			saveValue("rawJSON", null, "string");
		}

		updateIntervall = store._this.setInterval(async () => {
			try {
				await updateToken();
				const mode = await store._this.getStateAsync(dpRoot + ".mode");

				if (mode && !mode.ack && mode.val) {
					updateDevicePower(store.device, mode.val as number);
				}
				const silent = await this.getStateAsync(dpRoot + ".silent");
				if (silent && !silent.ack && silent.val) {
					updateDevicePower(store.device, silent.val as number);
				}
			} catch (error: any) {
				store._this.log.error(JSON.stringify(error));
				store._this.log.error(JSON.stringify(error.stack));
			}
		}, store.interval * 1000);

		tokenRefreshTimer = this.setInterval(async function () {
			store.token = "";
			store._this.log.debug("Token will be refreshed.");
			await updateToken();
		}, 3600000);

		this.on("stateChange", async (id, state) => {
			try {
				if (id === dpRoot + ".mode" && state && !state.ack) {
					this.log.debug("Mode: " + JSON.stringify(state));
					if (state && state.val) {
						const mode = parseInt(state.val as string);
						updateDevicePower(store.device, mode as number);
					}
				}

				if (id === dpRoot + ".silent" && state && !state.ack) {
					this.log.debug("Silent: " + JSON.stringify(state));
					if (state && state.val) {
						updateDeviceSilent(store.device, state.val as boolean);
					}
				}

				if (id === dpRoot + ".tempSet" && state && !state.ack) {
					this.log.debug("TempSet: " + JSON.stringify(state));

					if (state && state.val) {
						updateDeviceSetTemp(store.device, state.val as number);
					}
				}
			} catch (error: any) {
				store._this.log.error(JSON.stringify(error));
				store._this.log.error(JSON.stringify(error.stack));
			}
		});

		await this.subscribeStatesAsync(dpRoot + ".mode");
		await this.subscribeStatesAsync(dpRoot + ".silent");
		await this.subscribeStatesAsync(dpRoot + ".tempSet");
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			this.clearInterval(updateIntervall);
			this.clearInterval(tokenRefreshTimer);

			callback();
		} catch (e) {
			callback();
		}
	}
}
let adapter;

if (require.main !== module) {
	// Export the constructor in compact mode
	adapter = (options: Partial<utils.AdapterOptions> | undefined) => new MidasAquatemp(options);
} else {
	// otherwise start the instance directly
	(() => new MidasAquatemp())();
}
export { adapter };
