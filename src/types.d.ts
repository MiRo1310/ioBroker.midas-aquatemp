export interface CreateObjects {
    id: string;
    name: ioBroker.StringOrTranslated;
    type: ioBroker.CommonType;
    role: string;
    unit?: string;
    def?: any;
    states?: Record<string, string>;
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
