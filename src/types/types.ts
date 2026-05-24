export type ObjectResultResponse = ObjectResult[];

export interface ObjectResult {
    value: string;
    code: string;
}

export interface MidasData extends DefaultParams {
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

interface DefaultParams {
    sessionid: null | string;
    error_code: string; // "0"
    error_msg: 'Success';
    error_msg_code: string;
    totalSize: number | null;
    totalPage: number | null;
    nextPage: number | null;
    isReusltSuc: boolean;
}

export interface DeviceStatus extends DefaultParams {
    object_result?: {
        is_fault?: boolean;
        status?: string;
    };
    objectResult?: {
        is_fault?: boolean;
        isFault?: boolean;
        status?: string;
    };
}

export interface UpdateDeviceId extends DefaultParams {
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

export interface DeviceDetails extends DefaultParams {
    object_result?: ObjectResultResponse;
    objectResult?: ObjectResultResponse;
}

export interface RequestToken {
    object_result?: { 'x-token': string };
    objectResult?: { 'x-token': string };
    error_code?: string;
}

export interface IoBrokerState {
    /** The value of the state. */
    val: StateValue;

    /** Direction flag: false for desired value and true for actual value. Default: false. */
    ack: boolean;

    /** Unix timestamp. Default: current time */
    ts: number;

    /** Unix timestamp of the last time the value changed */
    lc: number;

    /** Name of the adapter instance which set the value, e.g. "system.adapter.web.0" */
    from: string;

    /** The user who set this value */
    user?: string;

    /** Optional time in seconds after which the state is reset to null */
    expire?: number;

    /** Optional quality of the state value */
    q?: STATE_QUALITY[keyof STATE_QUALITY];

    /** Optional comment */
    c?: string;
}

type StateValue = string | number | boolean | null;
interface STATE_QUALITY {
    /** The default value for a state */
    GOOD: 0x00;
    /** General problem */
    BAD: 0x01;
    /** The instance cannot establish a connection */
    CONNECTION_PROBLEM: 0x02;
    /** Substitute value from controller. Do not set this in adapters */
    SUBSTITUTE_FROM_CONTROLLER: 0x10;
    /** Quality for default values */
    SUBSTITUTE_INITIAL_VALUE: 0x20;
    /** Substitute value from instance or device */
    SUBSTITUTE_DEVICE_INSTANCE_VALUE: 0x40;
    /** Substitute value from a sensor */
    SUBSTITUTE_SENSOR_VALUE: 0x80;
    /** General problem by instance */
    GENERAL_INSTANCE_PROBLEM: 0x11;
    /** General problem by device */
    GENERAL_DEVICE_PROBLEM: 0x41;
    /** General problem by sensor */
    GENERAL_SENSOR_PROBLEM: 0x81;
    /** The instance is not connected */
    INSTANCE_NOT_CONNECTED: 0x12;
    /** The device is not connected */
    DEVICE_NOT_CONNECTED: 0x42;
    /** The sensor is not connected */
    SENSOR_NOT_CONNECTED: 0x82;
    /** The device has reported an error */
    DEVICE_ERROR_REPORT: 0x44;
    /** The sensor has reported an error */
    SENSOR_ERROR_REPORT: 0x84;
}
