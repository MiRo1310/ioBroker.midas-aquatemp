declare const consumptionFactorBrand: unique symbol;
declare const instanceNumberBrand: unique symbol;
declare const userNameBrand: unique symbol;

/**
 * A validated divisor for the raw current value (finite, > 0).
 * Branded so that a plain `number` (e.g. instance or apiLevel) can't be passed by accident —
 * obtain one only via {@link isConsumptionFactor} or {@link DEFAULT_CONSUMPTION_FACTOR}.
 */
export type ConsumptionFactor = number & { readonly [consumptionFactorBrand]: true };
export type InstanceNumber = number & { readonly [instanceNumberBrand]: true };
export type UserName = string & { readonly [userNameBrand]: true };

export function isConsumptionFactor(value: unknown): value is ConsumptionFactor {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function isInstanceNumber(value: unknown): value is InstanceNumber {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

export function isUsername(value: unknown): value is UserName {
    return isValidString(value);
}

function isValidString(value: unknown): value is string {
    return typeof value === 'string' && value !== '';
}
