import type { ObjectResultResponse } from '../types/types';

export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

export const isStateValue = (state?: ioBroker.State): boolean => isDefined(state) && isDefined(state?.val);

export const isToken = (token?: string | null): token is string => isDefined(token) && token !== '';

export const isApiSuccess = (errorCode?: string | number): boolean =>
    errorCode === undefined || errorCode === null || parseInt(String(errorCode), 10) === 0;

export const parseNumberOrNull = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const num = parseFloat(String(value).replace(',', '.'));
    return Number.isFinite(num) ? num : null;
};

export const parseIntOrNull = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const num = parseInt(String(value), 10);
    return Number.isFinite(num) ? num : null;
};

export function findCodeVal(result: ObjectResultResponse, code: string | string[]): string {
    if (!Array.isArray(code)) {
        return result.find(item => item.code === code)?.value ?? '';
    }
    for (let i = 0; i < code.length; i++) {
        const val = result.find(item => item.code === code[i])?.value;
        if (val !== undefined && val !== null && val !== '') {
            return val;
        }
    }
    return '';
}
