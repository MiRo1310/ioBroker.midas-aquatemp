import type { IoBrokerState, ObjectResultResponse } from '../types/types';
import type { TMode } from './store';

export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

export const isStateValue = (state?: IoBrokerState | null): boolean => isDefined(state) && isDefined(state?.val);

export const parseFloatOrNull = (value?: string | null): number => {
    if (value === '' || !isDefined(value)) {
        return 0;
    }
    const num = parseFloat(String(value).replace(',', '.'));
    return Number.isFinite(num) ? num : 0;
};

export const parseIntOrNull = (value?: string | null): number => {
    if (value === '' || !isDefined(value)) {
        return 0;
    }
    const num = parseInt(String(value), 10);
    return Number.isFinite(num) ? num : 0;
};

export function findCodeVal(result: ObjectResultResponse, code: string): string | undefined {
    return result.find(item => item.code === code)?.value;
}

export function resolveOnOffMode(stateVal: unknown, storedMode: TMode): TMode {
    if (!stateVal) {
        return -1;
    }
    const currentMode = parseInt(String(storedMode));
    return currentMode >= 0 ? (currentMode as TMode) : 0;
}

export function isRelevantStateId(id: string, knownIds: string[], device?: string): boolean {
    return knownIds.includes(id) && !!device;
}

export function findValByCodeArray(result: ObjectResultResponse, codes: string[]): string | undefined {
    for (const code of codes) {
        const value = result.find(item => item.code === code)?.value;
        if (!isDefined(value) || value === '') {
            continue;
        }
        return value;
    }
}
