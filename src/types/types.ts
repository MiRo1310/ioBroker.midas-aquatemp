export type ObjectResultResponse = ObjectResult[];

export interface ObjectResult {
    value: string;
    code: string;
}

export interface MidasData {
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
    error_code: string;
}
