/*
 * Created with @iobroker/create-adapter v2.6.3
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an
import type { TMode } from './lib/store';
import { Store } from './lib/store';
import * as utils from '@iobroker/adapter-core';
import { createObjects } from './lib/createState';
import { setupEndpoints } from './lib/endPoints';
import { isDefined, isStateValue } from './lib/utils';
import { errorLogger } from './lib/logging';
import { DeviceController } from './lib/deviceController';
import { TokenManager } from './lib/tokenManager';

let updateInterval: ioBroker.Interval | undefined;
let tokenRefreshTimer: ioBroker.Interval | undefined;

export class MidasAquatemp extends utils.Adapter {
    private static instance: MidasAquatemp;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'midas-aquatemp',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        MidasAquatemp.instance = this;
    }
    public static getInstance(): MidasAquatemp {
        return MidasAquatemp.instance;
    }

    private async onReady(): Promise<void> {
        const adapter = this;
        await this.setState('info.connection', false, true);
        if (!isDefined(this.instance)) {
            this.log.error('No instance found.');
            return;
        }
        const { username, password, refresh, selectApi, useDeviceMac, deviceMac } = this.config;
        const store = new Store(this, username, password, this.instance, refresh, selectApi, useDeviceMac, deviceMac);
        const tokenManager = new TokenManager(store);
        const deviceController = new DeviceController(store, tokenManager);

        const dpRoot = store.getDpRoot();

        const currentMode = parseInt(String((await this.getStateAsync(`${dpRoot}.mode`))?.val));
        if (store.isValidMode(currentMode)) {
            store.setMode(currentMode);
        }

        this.log.debug(`API-Level: ${this.config.selectApi}`);

        setupEndpoints(store);

        await createObjects(store);
        this.log.info('Objects created');
        await clearValues();
        await tokenManager.updateToken(deviceController);

        async function clearValues(): Promise<void> {
            await store.saveValue('error', true);
            await store.saveValue('consumption', 0);
            await store.saveValue('state', false);
            await store.saveValue('rawJSON', null);
        }

        updateInterval = this.setInterval(async () => {
            try {
                await tokenManager.updateToken(deviceController);
                const mode = await this.getStateAsync(`${dpRoot}.mode`);

                if (!mode?.ack && isDefined(mode?.val) && store.device) {
                    const modeVal = parseInt(String(mode.val));
                    if (!store.isValidMode(modeVal)) {
                        return;
                    }
                    await deviceController.updateDevicePower(modeVal);
                }

                const silent = await this.getStateAsync(`${dpRoot}.silent`);
                if (!silent?.ack && isStateValue(silent) && store.device) {
                    await deviceController.updateDeviceSilent(!!silent?.val);
                }
            } catch (error: any) {
                errorLogger('Error in updateInterval', error, adapter);
            }
        }, store.interval * 1000);

        tokenRefreshTimer = this.setInterval(async function () {
            tokenManager.resetToken();
            await tokenManager.updateToken(deviceController);
        }, 3600000);

        this.on('stateChange', async (id, state) => {
            try {
                if (!state || state.ack) {
                    return;
                }

                const isRelevantId =
                    id === `${dpRoot}.mode` ||
                    id === `${dpRoot}.silent` ||
                    id === `${dpRoot}.tempSet` ||
                    id === `${dpRoot}.state`;

                if (!isRelevantId || !store.device) {
                    return;
                }
                await tokenManager.fetchToken();

                if (id === `${dpRoot}.mode`) {
                    this.log.debug(`Mode: ${JSON.stringify(state)}`);

                    if (!isStateValue(state)) {
                        this.log.warn(`Ignoring invalid mode state payload for ${id}: ${JSON.stringify(state)}`);
                        return;
                    }

                    const mode = Number(state.val);

                    if (!Number.isFinite(mode) || !Number.isInteger(mode) || !store.isValidMode(mode)) {
                        this.log.warn(
                            `Ignoring unsupported mode value for ${id}: ${JSON.stringify(state.val)} (allowed: -1, 0, 1, 2)`,
                        );
                        return;
                    }

                    await deviceController.updateDevicePower(mode);

                    await this.setState(id, { ack: true });
                }

                if (id === `${dpRoot}.silent`) {
                    this.log.debug(`Silent: ${JSON.stringify(state)}`);

                    if (isStateValue(state)) {
                        await deviceController.updateDeviceSilent(state.val as boolean);
                    }
                    await this.setState(id, { ack: true });
                }

                if (id === `${dpRoot}.tempSet`) {
                    this.log.debug(`TempSet: ${JSON.stringify(state)}`);
                    if (isStateValue(state)) {
                        await deviceController.updateDeviceSetTemp(state.val as number);
                    }
                    await this.setState(id, { ack: true });
                }

                if (id === `${dpRoot}.state`) {
                    this.log.debug(`State: ${JSON.stringify(state)}`);
                    if (isStateValue(state)) {
                        if (!state.val) {
                            await deviceController.updateDevicePower(-1);
                        } else {
                            const currentMode = parseInt(String(store.getMode()));
                            await deviceController.updateDevicePower(currentMode >= 0 ? (currentMode as TMode) : 0);
                        }
                    }
                    await this.setState(id, { ack: true });
                }
            } catch (error: any) {
                errorLogger(`Error in stateChange for ${id}`, error, adapter);
            }
        });

        await this.subscribeStatesAsync(`${dpRoot}.mode`);
        await this.subscribeStatesAsync(`${dpRoot}.silent`);
        await this.subscribeStatesAsync(`${dpRoot}.tempSet`);
        await this.subscribeStatesAsync(`${dpRoot}.state`);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     *
     * @param callback Callback
     */
    private onUnload(callback: () => void): void {
        try {
            this.clearInterval(updateInterval);
            this.clearInterval(tokenRefreshTimer);

            callback();
        } catch (e: any) {
            callback();
            this.log.error(`Error: ${e.message}`);
        }
    }
}
let adapter;

if (require.main !== module) {
    // Export the constructor in compact mode
    adapter = (options: Partial<utils.AdapterOptions> | undefined): MidasAquatemp => new MidasAquatemp(options);
} else {
    // otherwise start the instance directly
    (() => new MidasAquatemp())();
}
export { adapter };
