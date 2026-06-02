import type { MidasAquatemp } from '../main';
import { saveValue } from './saveValue';

interface Store {
    adapter: MidasAquatemp;
    token: string | null;
    instance: number | undefined | null;
    username: string;
    encryptedPassword: string;
    cloudURL: string;
    AQUATEMP_POOLSANA: string;
    AQUATEMP_OTHER1: string;
    apiLevel: number;
    interval: number;
    device?: string;
    product?: string;
    reachable: boolean;
    useDeviceMac: boolean;
    getDpRoot: () => string;
    resetOnErrorHandler: () => Promise<void>;
    mode: TMode;
    setMode: (mode: TMode) => void;
    getMode: () => TMode;
    isValidMode: (val: number) => val is TMode;
}

export type TMode = -1 | 0 | 1 | 2;

export const modes: TMode[] = [-1, 0, 1, 2];

let store: Store;
export function initStore(): Store {
    if (!store) {
        store = {
            adapter: '' as unknown as MidasAquatemp,
            token: null,
            instance: null,
            username: '',
            encryptedPassword: '',
            cloudURL: '',
            apiLevel: 3,
            interval: 60000,
            device: undefined,
            product: undefined,
            reachable: false,
            useDeviceMac: false,
            mode: 2,
            // ProductIDs:
            // Gruppe 1:
            // 1132174963097280512: Midas/Poolsana InverPro
            AQUATEMP_POOLSANA: '1132174963097280512',
            // Gruppe 2:
            // 1442284873216843776:
            AQUATEMP_OTHER1: '1442284873216843776',
            getDpRoot: function () {
                return `midas-aquatemp.${this.instance}`;
            },
            resetOnErrorHandler: async function () {
                this.token = null;
                this.device = '';
                this.reachable = false;
                await saveValue({ key: 'info.connection', value: false, stateType: 'boolean', adapter: this.adapter });
            },
            setMode: function (mode: TMode) {
                this.mode = mode;
            },
            getMode: function (): TMode {
                return this.mode;
            },
            isValidMode: function (curr: number): curr is TMode {
                return modes.includes(curr as TMode);
            },
        };
    }
    return store;
}
