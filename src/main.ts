/*
 * Created with @iobroker/create-adapter v2.6.3
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an
import { initStore } from './lib/store';

import * as utils from '@iobroker/adapter-core';
import { createObjects } from './lib/createState';
import { encryptPassword } from './lib/encryptPassword';
import { setupEndpoints } from './lib/endPoints';
import { saveValue } from './lib/saveValue';

import { updateToken } from './lib/token';

import { updateDevicePower } from './lib/updateDevicePower';
import { updateDeviceSetTemp } from './lib/updateDeviceSetTemp';
import { updateDeviceSilent } from './lib/updateDeviceSilent';
import { isStateValue } from './lib/utils';
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
        const store = initStore();
        const adapter = this;
        store.adapter = this;
        store.instance = this.instance;

        const dpRoot = store.getDpRoot();
        await this.setState('info.connection', false, true);

        store.username = this.config.username;
        const password = this.config.password;
        store.interval = this.config.refresh;
        store.apiLevel = this.config.selectApi;
        if (this.config.useDeviceMac) {
            store.device = this.config.deviceMac;
        }

        store.useDeviceMac = this.config.useDeviceMac;
        this.log.debug(`API-Level: ${this.config.selectApi}`);

        setupEndpoints();

        encryptPassword(password);
        await createObjects(adapter);
        this.log.info('Objects created');
        await clearValues();
        await updateToken(adapter);

        async function clearValues(): Promise<void> {
            await saveValue({ key: 'error', value: true, stateType: 'boolean', adapter });
            await saveValue({ key: 'consumption', value: 0, stateType: 'number', adapter });
            await saveValue({ key: 'state', value: false, stateType: 'boolean', adapter });
            await saveValue({ key: 'rawJSON', value: null, stateType: 'string', adapter });
        }

        updateInterval = this.setInterval(async () => {
            try {
                await updateToken(adapter);
                const mode = await this.getStateAsync(`${dpRoot}.mode`);

                if (!mode?.ack && mode?.val) {
                    await updateDevicePower(adapter, store.device, mode.val as number);
                }
                const silent = await this.getStateAsync(`${dpRoot}.silent`);
                if (!silent?.ack && silent?.val) {
                    await updateDevicePower(adapter, store.device, silent.val as number);
                }
            } catch (error: any) {
                errorLogger('Error in updateInterval', error, adapter);
            }
        }, store.interval * 1000);

        tokenRefreshTimer = this.setInterval(async function () {
            store.token = '';
            await updateToken(adapter);
        }, 3600000);

        this.on('stateChange', async (id, state) => {
            try {
                if (!state || state.ack) {
                    return;
                }
                if (id === `${dpRoot}.mode`) {
                    this.log.debug(`Mode: ${JSON.stringify(state)}`);
                    if (isStateValue(state)) {
                        const mode = parseInt(state.val as string);
                        await updateDevicePower(adapter, store.device, mode);
                    }
                    await this.setState(id, { ack: true });
                }

                if (id === `${dpRoot}.silent`) {
                    this.log.debug(`Silent: ${JSON.stringify(state)}`);
                    if (isStateValue(state)) {
                        await updateDeviceSilent(adapter, store.device, state.val as boolean);
                    }
                    await this.setState(id, { ack: true });
                }

                if (id === `${dpRoot}.tempSet`) {
                    this.log.debug(`TempSet: ${JSON.stringify(state)}`);

                    if (isStateValue(state)) {
                        await updateDeviceSetTemp(adapter, store.device, state.val as number);
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
