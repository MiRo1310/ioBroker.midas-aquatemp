import type { MidasAquatemp } from '../main';
import { createHash } from 'crypto';
import { errorLogger } from './logging';
import type { TokenManager } from './tokenManager';

export type TMode = -1 | 0 | 1 | 2;

export type StateKey =
    | 'error'
    | 'mode'
    | 'info.connection'
    | 'errorLevel'
    | 'errorCode'
    | 'errorMessage'
    | 'DeviceCode'
    | 'ProductCode'
    | 'rawJSON'
    | 'consumption'
    | 'suctionTemp'
    | 'tempIn'
    | 'tempOut'
    | 'coilTemp'
    | 'ambient'
    | 'voltage'
    | 'rotor'
    | 'tempSet'
    | 'silent'
    | 'flowSwitch'
    | 'state';

const states: Record<StateKey, ioBroker.CommonType> = {
    error: 'boolean',
    mode: 'number',
    errorLevel: 'number',
    errorCode: 'string',
    errorMessage: 'string',
    DeviceCode: 'string',
    ProductCode: 'string',
    rawJSON: 'string',
    'info.connection': 'boolean',
    consumption: 'number',
    state: 'boolean',
    suctionTemp: 'number',
    tempIn: 'number',
    tempOut: 'number',
    tempSet: 'number',
    coilTemp: 'number',
    ambient: 'number',
    voltage: 'number',
    rotor: 'number',
    silent: 'boolean',
    flowSwitch: 'boolean',
};

export class Store {
    static readonly modes: TMode[] = [-1, 0, 1, 2];
    public static readonly AQUATEMP_POOLSANA = '1132174963097280512'; //Midas/Poolsana InverPro
    public static readonly AQUATEMP_OTHER1 = '1442284873216843776';
    public readonly instance: number;
    public readonly interval: number = 60000;
    public cloudURL: string | null = null;
    public apiLevel = 3;
    public device?: string;
    public product: string | null = null;
    public reachable = false;
    public useDeviceMac = false;
    private mode: TMode = 2;
    public readonly encryptedPassword: string;
    private tokenManager?: TokenManager;
    constructor(
        public readonly adapter: MidasAquatemp,
        public readonly username: string,
        password: string,
        instance: number,
        interval?: number,
        apiLevel?: number,
        useDeviceMac?: boolean,
        deviceMac?: string,
    ) {
        this.adapter = adapter;
        this.username = username;
        this.encryptedPassword = this.encryptPassword(password);
        this.instance = instance;
        this.interval = interval ?? this.interval;
        this.apiLevel = apiLevel ?? this.apiLevel;
        this.useDeviceMac = useDeviceMac ?? this.useDeviceMac;
        if (useDeviceMac) {
            this.device = deviceMac ?? this.device;
        }
    }

    public setTokenManager(tokenManager: TokenManager): void {
        this.tokenManager = tokenManager;
    }

    public getDpRoot(): string {
        return `midas-aquatemp.${this.instance}`;
    }

    public async resetOnErrorHandler(): Promise<void> {
        this.tokenManager?.resetToken();
        this.device = '';
        this.reachable = false;
        await this.saveValue('info.connection', false);
    }

    public setMode(mode: TMode): void {
        this.mode = mode;
    }

    public getMode(): TMode {
        return this.mode;
    }

    public isValidMode(curr: number): curr is TMode {
        return Store.modes.includes(curr as TMode);
    }

    public async saveValue(key: StateKey, value?: ioBroker.StateValue): Promise<void> {
        try {
            const dp = `${this.getDpRoot()}.${key}`;

            await this.adapter.setObjectNotExists(dp, {
                type: 'state',
                common: {
                    name: key,
                    type: states[key],
                    role: 'value',
                    read: true,
                    write: false,
                },
                native: {},
            });

            await this.adapter.setState(dp, value ?? null, true);
        } catch (err: any) {
            errorLogger('Error in saveValue', err, this.adapter);
        }
    }

    private encryptPassword(password: string): string {
        return createHash('md5').update(password).digest('hex');
    }
}
