import type {
    InputGetAxiosUpdateDevicePowerParams,
    InputGetAxiosUpdateDeviceSetTempParams,
    AxiosUpdateDeviceParams,
    AxiosUpdateDeviceParam,
} from '../types';
import { initStore } from './store';

const PRODUCT_IDS = [
    '1132174963097280512',
    '1186904563333062656',
    '1158905952238313472',
    '1245226668902080512',
    '1442284873216843776',
    '1548963836789501952',
];

const CODES_POOLSANA = [
    'Power',
    'Mode',
    'Manual-mute',
    'T01',
    'T02',
    '2074',
    '2075',
    '2076',
    '2077',
    'H03',
    'Set_Temp',
    'R08',
    'R09',
    'R10',
    'R11',
    'R01',
    'R02',
    'R03',
    'T03',
    '1158',
    '1159',
    'F17',
    'H02',
    'T04',
    'T05',
    'T07',
    'T14',
    'T17',
    'S03',
];

const CODES_OTHER = [
    'Power',
    'Mode',
    'Manual-mute',
    'T1',
    'T2',
    'T3',
    'T4',
    'T5',
    '2074',
    '2075',
    '2076',
    '2077',
    'H03',
    'Set_Temp',
    'R08',
    'R09',
    'R10',
    'R11',
    'R01',
    'R02',
    'R03',
    'T03',
    '1158',
    '1159',
    'F17',
    'H02',
    'T7',
    'T14',
    'T17',
    'S3',
];

export const getProtocolCodes = (
    deviceCode: string,
    productId?: string,
): { device_code?: string; deviceCode?: string; protocal_codes?: string[]; protocalCodes?: string[] } => {
    const store = initStore();
    const codes = productId === store.AQUATEMP_POOLSANA ? CODES_POOLSANA : CODES_OTHER;

    return store.apiLevel < 3
        ? { device_code: deviceCode, protocal_codes: codes }
        : { deviceCode, protocalCodes: codes };
};

export const getAxiosUpdateDeviceIdParams = (): { product_ids?: string[]; productIds?: string[] } => {
    const store = initStore();
    return store.apiLevel < 3 ? { product_ids: PRODUCT_IDS } : { productIds: PRODUCT_IDS };
};

const controlParam = (deviceCode: string, protocolCode: string, value: string | number): AxiosUpdateDeviceParam => {
    const store = initStore();
    return store.apiLevel < 3
        ? { device_code: deviceCode, protocol_code: protocolCode, value }
        : { deviceCode, protocolCode, value };
};

export const getAxiosUpdateDevicePowerParams = ({
    deviceCode,
    value,
    protocolCode,
}: InputGetAxiosUpdateDevicePowerParams): AxiosUpdateDeviceParams => {
    return {
        param: [controlParam(deviceCode, protocolCode, value)],
    };
};

export const getAxiosUpdateDeviceSetTempParams = ({
    deviceCode,
    sTemperature,
}: InputGetAxiosUpdateDeviceSetTempParams): AxiosUpdateDeviceParams => {
    return {
        param: ['R01', 'R02', 'R03', 'Set_Temp'].map(code => controlParam(deviceCode, code, sTemperature)),
    };
};

export const getHeaders = (token: string): { headers: { 'x-token': string } } => {
    return {
        headers: { 'x-token': token },
    };
};
