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
import { ApiClient, ResetError } from './lib/apiClient';

export class MidasAquatemp extends utils.Adapter {
    private static instance: MidasAquatemp;
    private static tokenRefreshIntervalTime = 3600000;
    private updateInterval?: ioBroker.Interval;
    private tokenRefreshInterval?: ioBroker.Interval;
    private interval: number = 60;
    private store!: Store;
    private silentId!: string;
    private stateId!: string;
    private tempSetId!: string;
    private modeId!: string;

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
        await this.setState('info.connection', false, true);
        if (!isDefined(this.instance)) {
            this.log.error('No instance found.');
            return;
        }
        const { username, password, selectApi, useDeviceMac, deviceMac, refresh } = this.config;
        this.interval = refresh ?? this.interval;
        if (username === '' || password === '' || password === undefined) {
            this.log.error('Empty Username or Password.');
            return;
        }
        this.store = new Store(this, username, password, this.instance, selectApi, useDeviceMac, deviceMac);
        this.setIds();
        const apiClient = new ApiClient(this.store);
        const tokenManager = new TokenManager(this.store, apiClient);
        const deviceController = new DeviceController(this.store, tokenManager, apiClient);
        try {
            tokenManager.setDeviceController(deviceController);
            const currentMode = parseInt(String((await this.getStateAsync(this.modeId))?.val));
            if (this.store.isValidMode(currentMode)) {
                this.store.setMode(currentMode);
            }

            this.log.info(`API level: ${this.config.selectApi}, refresh interval: ${this.interval}s`);

            await createObjects(this.store);
            this.log.info('Objects created');

            await this.store.clearStateValues();
            await tokenManager.updateTokenAndDeviceId();

            this.updateInterval = this.setInterval(async () => {
                await tokenManager.updateTokenAndDeviceId();
            }, this.interval * 1000);

            this.tokenRefreshInterval = this.setInterval(async function () {
                tokenManager.resetToken();
                await tokenManager.updateTokenAndDeviceId();
            }, MidasAquatemp.tokenRefreshIntervalTime);

            this.on('stateChange', async (id, state) => {
                try {
                    if (!state || state.ack) {
                        return;
                    }

                    if (!this.isRelevant(id)) {
                        return;
                    }

                    await tokenManager.ensureValidToken();

                    if (id === this.modeId) {
                        this.log.debug(`Mode: ${JSON.stringify(state)}`);

                        if (!isStateValue(state)) {
                            this.log.warn(`Ignoring invalid mode state payload for ${id}: ${JSON.stringify(state)}`);
                            return;
                        }

                        const mode = Number(state.val);

                        if (!this.store.isValidMode(mode)) {
                            this.log.warn(
                                `Ignoring unsupported mode value for ${id}: ${JSON.stringify(state.val)} (allowed: -1, 0, 1, 2)`,
                            );
                            return;
                        }

                        await deviceController.updateDevicePower(mode);

                        await this.setState(id, { ack: true });
                    } else if (id === this.silentId) {
                        this.log.debug(`Silent: ${JSON.stringify(state)}`);

                        if (isStateValue(state)) {
                            await deviceController.updateDeviceSilent(state.val as boolean);
                        }
                        await this.setState(id, { ack: true });
                    } else if (id === this.tempSetId) {
                        this.log.debug(`TempSet: ${JSON.stringify(state)}`);
                        if (isStateValue(state)) {
                            await deviceController.updateDeviceSetTemp(state.val as number);
                        }
                        await this.setState(id, { ack: true });
                    } else if (id === this.stateId) {
                        this.log.debug(`State: ${JSON.stringify(state)}`);
                        await deviceController.updateDevicePower(this.getMode(state));
                        await this.setState(id, { ack: true });
                    }
                } catch (error) {
                    if (error instanceof ResetError) {
                        await this.store.resetAndHandleErrorWithSentry(`Error in stateChange (${id})`, error);
                        return;
                    }
                    this.store.logger.errorHandler(`Error in stateChange (${id})`, error);
                }
            });
            await Promise.all([
                this.subscribeStatesAsync(this.store.getStateIdByKey('mode')),
                this.subscribeStatesAsync(this.store.getStateIdByKey('silent')),
                this.subscribeStatesAsync(this.store.getStateIdByKey('tempSet')),
                this.subscribeStatesAsync(this.store.getStateIdByKey('state')),
            ]);
        } catch (error) {
            this.store.logger.errorHandler(`Error in onReady`, error);
        }
    }

    private getMode(state: ioBroker.State): TMode {
        if (!state.val) {
            return -1;
        }
        const currentMode = parseInt(String(this.store.getMode()));
        return currentMode >= 0 ? (currentMode as TMode) : 0;
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

    private setIds(): void {
        this.silentId = this.store.getStateIdByKey('silent');
        this.stateId = this.store.getStateIdByKey('state');
        this.tempSetId = this.store.getStateIdByKey('tempSet');
        this.modeId = this.store.getStateIdByKey('mode');
    }

    private isRelevant(id: string): boolean {
        return [this.modeId, this.silentId, this.stateId, this.tempSetId].includes(id) && !!this.store.device;
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
