export interface CreateObjects {
    id: string;
    name: ioBroker.StringOrTranslated;
    type: ioBroker.CommonType;
    role: string;
    unit?: string;
    def?: any;
    states?: string;
    write?: boolean;
}

export interface ReturnGetProtocolCodes {
    device_code: string;
    deviceCode: string;
    protocal_codes: string[];
    protocalCodes: string[];
}

export interface ReturnGetAxiosUpdateDevicePowerParams {
    param: [
        {
            device_code: string;
            deviceCode: string;
            protocol_code: string;
            protocolCode: string;
            value: number | string;
        },
    ];
}
export interface InputGetAxiosUpdateDevicePowerParams {
    deviceCode: string;
    value: number | string;
    protocolCode: string;
}
export interface ReturnGetAxiosUpdateDeviceSetTempParams {
    param: [
        {
            device_code: string;
            deviceCode: string;
            protocol_code: string;
            protocolCode: string;
            value: string;
        },
        {
            device_code: string;
            deviceCode: string;
            protocol_code: string;
            protocolCode: string;
            value: string;
        },
        {
            device_code: string;
            deviceCode: string;
            protocol_code: string;
            protocolCode: string;
            value: string;
        },
        {
            device_code: string;
            deviceCode: string;
            protocol_code: string;
            protocolCode: string;
            value: string;
        },
    ];
}
export interface InputGetAxiosUpdateDeviceSetTempParams {
    deviceCode: string;
    sTemperature: string;
}
export interface Modes {
    [key: number]: string;
}
