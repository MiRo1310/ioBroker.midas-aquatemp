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
import { saveValue } from './lib/saveValue';

import { ensureToken, updateToken } from './lib/token';

import { updateDevicePower } from './lib/updateDevicePower';
import { updateDeviceSetTemp } from './lib/updateDeviceSetTemp';
import { updateDeviceSilent } from './lib/updateDeviceSilent';
import { isDefined, isStateValue } from './lib/utils';
import { errorLogger } from './lib/logging';

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
        }
        const { username, password, refresh, selectApi, useDeviceMac, deviceMac } = this.config;
        const store = new Store(
            this,
            username,
            password,
            this.instance as number,
            refresh,
            selectApi,
            useDeviceMac,
            deviceMac,
        );

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
        await updateToken(store);

        async function clearValues(): Promise<void> {
            await saveValue({ key: 'error', value: true, stateType: 'boolean', store });
            await saveValue({ key: 'consumption', value: 0, stateType: 'number', store });
            await saveValue({ key: 'state', value: false, stateType: 'boolean', store });
            await saveValue({ key: 'rawJSON', value: null, stateType: 'string', store });
        }

        updateInterval = this.setInterval(async () => {
            try {
                await updateToken(store);
                const mode = await this.getStateAsync(`${dpRoot}.mode`);

                if (!mode?.ack && isDefined(mode?.val) && store.device) {
                    const modeVal = parseInt(String(mode.val));
                    if (!store.isValidMode(modeVal)) {
                        return;
                    }
                    await updateDevicePower(store, modeVal);
                }

                const silent = await this.getStateAsync(`${dpRoot}.silent`);
                if (!silent?.ack && isStateValue(silent) && store.device) {
                    await updateDeviceSilent(store, !!silent?.val);
                }
            } catch (error: any) {
                errorLogger('Error in updateInterval', error, adapter);
            }
        }, store.interval * 1000);

        tokenRefreshTimer = this.setInterval(async function () {
            store.token = '';
            await updateToken(store);
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
                await ensureToken(store);

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

                    await updateDevicePower(store, mode);

                    await this.setState(id, { ack: true });
                }

                if (id === `${dpRoot}.silent`) {
                    this.log.debug(`Silent: ${JSON.stringify(state)}`);

                    if (isStateValue(state)) {
                        await updateDeviceSilent(store, state.val as boolean);
                    }
                    await this.setState(id, { ack: true });
                }

                if (id === `${dpRoot}.tempSet`) {
                    this.log.debug(`TempSet: ${JSON.stringify(state)}`);
                    if (isStateValue(state)) {
                        await updateDeviceSetTemp(store, state.val as number);
                    }
                    await this.setState(id, { ack: true });
                }

                if (id === `${dpRoot}.state`) {
                    this.log.debug(`State: ${JSON.stringify(state)}`);
                    if (isStateValue(state)) {
                        if (!state.val) {
                            await updateDevicePower(store, -1);
                        } else {
                            const currentMode = parseInt(String(store.getMode()));
                            await updateDevicePower(store, currentMode >= 0 ? (currentMode as TMode) : 0);
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
