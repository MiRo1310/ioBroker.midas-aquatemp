/*
 * Created with @iobroker/create-adapter v2.6.3
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an
import type { TMode } from './lib/store';
import { Store } from './lib/store';
import * as utils from '@iobroker/adapter-core';
import { createObjects } from './lib/createState';
import { isDefined, isStateValue } from './lib/utils';
import { DeviceController } from './lib/deviceController';
import { TokenManager } from './lib/tokenManager';
import { ApiClient } from './lib/apiClient';

export class MidasAquatemp extends utils.Adapter {
    private static instance: MidasAquatemp;
    private static tokenRefreshIntervalTime = 3600000;
    private updateInterval?: ioBroker.Interval;
    private tokenRefreshInterval?: ioBroker.Interval;
    private readonly interval: number = 60000;

    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: 'midas-aquatemp',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        MidasAquatemp.instance = this;

        this.interval = this.config.refresh ?? this.interval;
    }

    public static getInstance(): MidasAquatemp {
        return MidasAquatemp.instance;
    }

    private async onReady(): Promise<void> {
        await this.setState('info.connection', false, true);
        if (!isDefined(this.instance)) {
            this.log.error('No instance found.');
            return;
        }
        const { username, password, selectApi, useDeviceMac, deviceMac } = this.config;
        const store = new Store(this, username, password, this.instance, selectApi, useDeviceMac, deviceMac);
        const apiClient = new ApiClient(store);
        const tokenManager = new TokenManager(store, apiClient);
        const deviceController = new DeviceController(store, tokenManager, apiClient);
        tokenManager.setDeviceController(deviceController);

        const dpRoot = store.getDpRoot();

        const currentMode = parseInt(String((await this.getStateAsync(`${dpRoot}.mode`))?.val));
        if (store.isValidMode(currentMode)) {
            store.setMode(currentMode);
        }

        this.log.debug(`API-Level: ${this.config.selectApi}`);

        await createObjects(store);
        this.log.info('Objects created');

        await store.clearStateValues();
        await tokenManager.updateToken();

        this.updateInterval = this.setInterval(async () => {
            try {
                await tokenManager.updateToken();
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
                store.logger.errorHandler('Error in updateInterval', error);
            }
        }, this.interval * 1000);

        this.tokenRefreshInterval = this.setInterval(async function () {
            tokenManager.resetToken();
            await tokenManager.updateToken();
        }, MidasAquatemp.tokenRefreshIntervalTime);

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
                    if (!state.val) {
                        await deviceController.updateDevicePower(-1);
                    } else {
                        const currentMode = parseInt(String(store.getMode()));
                        await deviceController.updateDevicePower(currentMode >= 0 ? (currentMode as TMode) : 0);
                    }
                    await this.setState(id, { ack: true });
                }
            } catch (error: any) {
                store.logger.errorHandler(`Error in stateChange for ${id}`, error);
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
            this.clearInterval(this.updateInterval);
            this.clearInterval(this.tokenRefreshInterval);

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
