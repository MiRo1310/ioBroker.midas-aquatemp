import type { MidasAquatemp } from '../main';
import { createHash } from 'crypto';
import { Logger } from './logging';
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
    public cloudURL: string | null = null;
    public apiLevel = 3;
    public device?: string;
    public product: string | null = null;
    public reachable = false;
    public useDeviceMac = false;
    private mode: TMode = 2;
    public readonly encryptedPassword: string;
    private tokenManager?: TokenManager;
    public readonly logger: Logger;

    constructor(
        public readonly adapter: MidasAquatemp,
        public readonly username: string,
        password: string,
        instance: number,
        apiLevel?: number,
        useDeviceMac?: boolean,
        deviceMac?: string,
    ) {
        this.encryptedPassword = this.encryptPassword(password);
        this.instance = instance;
        this.apiLevel = apiLevel ?? this.apiLevel;
        this.useDeviceMac = useDeviceMac ?? this.useDeviceMac;
        if (useDeviceMac) {
            this.device = deviceMac ?? this.device;
        }
        this.setupEndpoints();
        this.logger = new Logger(this.adapter);
    }

    public setTokenManager(tokenManager: TokenManager): void {
        this.tokenManager = tokenManager;
    }

    public getDpRoot = (): string => {
        return `midas-aquatemp.${this.instance}`;
    };

    public resetOnError = async (): Promise<void> => {
        this.tokenManager?.resetToken();
        this.device = '';
        this.reachable = false;
        await this.saveValue('info.connection', false);
    };

    public async resetAndHandleErrorWithSentry(title: string, e: any): Promise<void> {
        await this.resetOnError();
        this.logger.errorHandler(title, e);
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

    public saveValue = async (key: StateKey, value?: ioBroker.StateValue): Promise<void> => {
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
            this.logger.errorHandler('Error in saveValue', err);
        }
    };

    public async clearStateValues(): Promise<void> {
        await this.saveValue('error', true);
        await this.saveValue('consumption', 0);
        await this.saveValue('state', false);
        await this.saveValue('rawJSON', null);
    }

    public getSUrl(): string {
        return this.apiLevel < 3 ? `${this.cloudURL}/app/device/control.json` : `${this.cloudURL}/app/device/control`;
    }

    public getSUrlUpdateDeviceId(): string {
        return this.apiLevel < 3
            ? `${this.cloudURL}/app/device/getDataByCode.json`
            : `${this.cloudURL}/app/device/getDataByCode`;
    }

    public getOptionsAndSUrl(): {
        sUrl: string;
        options: {
            userName?: string;
            user_name?: string;
            password: string;
            type: string;
        };
    } {
        const options = { password: this.encryptedPassword, type: '2' };
        return this.apiLevel < 3
            ? {
                  sUrl: `${this.cloudURL}/app/user/login.json`,
                  options: {
                      user_name: this.username,
                      ...options,
                  },
              }
            : {
                  sUrl: `${this.cloudURL}/app/user/login`,
                  options: {
                      userName: this.username,
                      ...options,
                  },
              };
    }

    public getUpdateDeviceStatusSUrl(): string {
        return this.apiLevel < 3
            ? `${this.cloudURL}/app/device/getDeviceStatus.json`
            : `${this.cloudURL}/app/device/getDeviceStatus`;
    }

    public getUpdateDeviceIdSUrl(): string {
        return this.apiLevel < 3
            ? `${this.cloudURL}/app/device/deviceList.json`
            : `${this.cloudURL}/app/device/deviceList`;
    }

    private encryptPassword(password: string): string {
        return createHash('md5').update(password).digest('hex');
    }

    private setupEndpoints(): void {
        this.cloudURL =
            this.apiLevel == 3
                ? 'https://cloud.linked-go.com:449/crmservice/api'
                : 'https://cloud.linked-go.com/cloudservice/api';
    }
}
