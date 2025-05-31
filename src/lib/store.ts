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
    device: string;
    product: string;
    reachable: boolean;
    useDeviceMac: boolean;
    getDpRoot: () => string;
    resetOnErrorHandler: () => void;
}

let store: Store;
export function initStore(): Store {
    if (!store) {
        store = {
            adapter: '' as unknown as MidasAquatemp,
            token: '',
            instance: null,
            username: '',
            encryptedPassword: '',
            cloudURL: '',
            apiLevel: 3,
            interval: 60000,
            device: '',
            product: '',
            reachable: false,
            useDeviceMac: false,
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
                this.token = '';
                this.device = '';
                this.reachable = false;
                await saveValue({ key: 'info.connection', value: false, stateType: 'boolean', adapter: this.adapter });
            },
        };
    }
    return store;
}
