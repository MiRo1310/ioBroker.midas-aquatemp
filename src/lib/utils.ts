import type { IoBrokerState, ObjectResultResponse } from '../types/types';

export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

export const isStateValue = (state?: IoBrokerState | null): boolean => isDefined(state) && isDefined(state?.val);

export const parseFloatOrNull = (value: string | null | undefined): number => {
    if (value === '' || !isDefined(value)) {
        return 0;
    }
    const num = parseFloat(String(value).replace(',', '.'));
    return Number.isFinite(num) ? num : 0;
};

export const parseIntOrNull = (value: string | null | undefined): number => {
    if (value === '' || !isDefined(value)) {
        return 0;
    }
    const num = parseInt(String(value), 10);
    return Number.isFinite(num) ? num : 0;
};

export function findCodeVal(result: ObjectResultResponse, code: string): string | undefined {
    return result.find(item => item.code === code)?.value;
}
