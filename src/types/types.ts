export type ObjectResultResponse = ObjectResult[];

export interface ObjectResult {
    value: string;
    code: string;
}

export interface MidasData {
    sessionid: null | string;
    error_code: string; // "0"
    error_msg: 'Success';
    error_msg_code: string;
    totalSize: number | null;
    totalPage: number | null;
    nextPage: number | null;
    object_result?: {
        device_status: 'ONLINE' | 'OFFLINE';
        is_fault: boolean;
        fault_code: string;
        error_level: number;
        description: string;
        device_code?: string;
        product_id?: string;
    }[];
    objectResult?: {
        deviceStatus: 'ONLINE' | 'OFFLINE';
        isFault: boolean;
        faultCode: string;
        errorLevel: number;
        description: string;
        deviceCode?: string;
        productId?: string;
    }[];
}

export interface DeviceStatus {
    sessionid: null | string;
    error_code: string; // "0"
    error_msg: 'Success';
    error_msg_code: string;
    totalSize: number | null;
    totalPage: number | null;
    nextPage: number | null;
    isReusltSuc: boolean;
    object_result?: {
        // TODO : Not validated Type
        is_fault: boolean;
        isFault: boolean;
        status: string;
    }[];
    objectResult?: {
        is_fault: boolean; // Validated Type
        isFault: boolean;
        status: string;
    }[];
}

export interface UpdateDeviceId {
    sessionid: null | string;
    error_code: string; // "0"
    error_msg: 'Success';
    error_msg_code: string;
    totalSize: number | null;
    totalPage: number | null;
    nextPage: number | null;
    isReusltSuc: boolean;
    object_result?: {
        houseId: string; // TODO : Not validated Type
        dtuSoftwareCode: null | string;
        device_type: string;
        deviceName: null | string;
        deviceId: string;
        deviceStatus: string;
        device_name: null | string;
        product_id: string;
        dtuSignalIntensity: string;
        model: string;
        sn: string;
        dtuIccid: string;
        deviceType: string;
        device_status: string;
        productMessageType: string | null;
        is_fault: boolean;
        device_id: string;
        productId: string;
        custModel: null | string;
        deviceNickName: string;
        dtuSoftwareVer: null | string;
        deviceCode: string;
        isFault: boolean;
        wifiSoftwareVer: string;
        device_code: string;
        wifiSoftwareCode: string;
        isExpire: boolean;
        device_nick_name: string;
        projectId: null | string;
    }[];
    objectResult?: {
        houseId: string; // Validated Type
        dtuSoftwareCode: null | string;
        device_type: string;
        deviceName: null | string;
        deviceId: string;
        deviceStatus: string;
        device_name: null | string;
        product_id: string;
        dtuSignalIntensity: string;
        model: string;
        sn: string;
        dtuIccid: string;
        deviceType: string;
        device_status: string;
        productMessageType: string | null;
        is_fault: boolean;
        device_id: string;
        productId: string;
        custModel: null | string;
        deviceNickName: string;
        dtuSoftwareVer: null | string;
        deviceCode: string;
        isFault: boolean;
        wifiSoftwareVer: string;
        device_code: string;
        wifiSoftwareCode: string;
        isExpire: boolean;
        device_nick_name: string;
        projectId: null | string;
    }[];
}

export interface DeviceDetails {
    sessionid: null | string;
    error_code: string;
    error_msg: string;
    error_msg_code: string;
    totalSize: number | null;
    totalPage: number | null;
    nextPage: number | null;
    isReusltSuc: boolean;
    object_result?: ObjectResultResponse;
    objectResult?: ObjectResultResponse;
}

export interface RequestToken {
    object_result?: { 'x-token': string };
    objectResult?: { 'x-token': string };
}
