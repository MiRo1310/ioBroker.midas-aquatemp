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

export interface AxiosUpdateDeviceParams {
    param: AxiosUpdateDeviceParam[];
}

export interface AxiosUpdateDeviceParam {
    device_code?: string;
    deviceCode?: string;
    protocol_code?: string;
    protocolCode?: string;
    value: number | string;
}

export interface InputGetAxiosUpdateDevicePowerParams {
    deviceCode: string;
    value: number | string;
    protocolCode: string;
}
// export interface ReturnGetAxiosUpdateDeviceSetTempParams {
//     param: [
//         {
//             device_code: string;
//             deviceCode: string;
//             protocol_code: string;
//             protocolCode: string;
//             value: string |number;
//         },
//     ];
// }
export interface InputGetAxiosUpdateDeviceSetTempParams {
    deviceCode: string;
    sTemperature: string;
}
