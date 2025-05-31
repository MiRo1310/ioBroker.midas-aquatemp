export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

export const isStateValue = (state?: ioBroker.State): boolean => isDefined(state) && isDefined(state?.val);

export const isToken = (token?: string | null): token is string => isDefined(token) && token !== '';

export const noError = (errorCode?: string): boolean => errorCode === '0';
