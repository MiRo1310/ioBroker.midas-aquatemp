import type { MidasAquatemp } from '../main';
import { saveValue } from './saveValue';
import { createHash } from 'crypto';

export type TMode = -1 | 0 | 1 | 2;

export const modes: TMode[] = [-1, 0, 1, 2];

export class Store {
    public readonly adapter: MidasAquatemp;
    public readonly instance: number;
    public readonly username: string;
    public readonly encryptedPassword: string;
    public readonly interval: number = 60000;
    public token: string | null = null;
    public cloudURL: string | null = null;
    public apiLevel = 3;
    public device?: string;
    public product: string | null = null;
    public reachable = false;
    public useDeviceMac = false;
    private mode: TMode = 2;
    public AQUATEMP_POOLSANA = '1132174963097280512'; //Midas/Poolsana InverPro
    public AQUATEMP_OTHER1 = '1442284873216843776';

    constructor(
        adapter: MidasAquatemp,
        username: string,
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

    public getDpRoot(): string {
        return `midas-aquatemp.${this.instance}`;
    }

    public async resetOnErrorHandler(): Promise<void> {
        this.token = null;
        this.device = '';
        this.reachable = false;
        await saveValue({ key: 'info.connection', value: false, stateType: 'boolean', store: this });
    }
    public setMode(mode: TMode): void {
        this.mode = mode;
    }
    public getMode(): TMode {
        return this.mode;
    }
    public isValidMode(curr: number): curr is TMode {
        return modes.includes(curr as TMode);
    }
    private encryptPassword(password: string): string {
        return createHash('md5').update(password).digest('hex');
    }
}
