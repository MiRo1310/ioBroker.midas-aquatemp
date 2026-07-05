import type { StateKey, Store, TMode } from './store';
import type { DeviceDetails, DeviceStatus, MidasData, ObjectResultResponse, UpdateDeviceId } from '../types/types';
import { CODES, PRODUCT_IDS } from './axiosParameter';
import { findCodeVal, findValByCodeArray, isDefined, parseFloatOrNull, parseIntOrNull } from './utils';
import type { TokenManager } from './tokenManager';
import type { ApiClient } from './apiClient';
import { ApiError, ResetError } from './apiClient';
import type { AxiosUpdateDeviceParam, AxiosUpdateDeviceParams } from '../types';

export class DeviceController {
    constructor(
        private readonly store: Store,
        private readonly tokenManager: TokenManager,
        private readonly apiClient: ApiClient,
        private apiType: 'default' | 'legacy' | null = null,
    ) {}

    public async updateDeviceStatus(): Promise<void> {
        const res = this.getTokenAndDevice();
        if (!res) {
            return;
        }

        const payload = this.isApiLevelLessThan3() ? { device_code: res.device } : { deviceCode: res.device };

        const data = await this.apiClient.request<DeviceStatus>(
            this.store.getUpdateDeviceStatusSUrl(),
            payload,
            res.token,
        );

        this.store.logger.debug(`Device status response: ${JSON.stringify(data)}`);

        const isOnline = this.isOnline(data);
        this.store.isOnline = isOnline;
        await this.store.saveValue('info.connection', isOnline);
        await this.store.saveValue('online', isOnline);

        if (!isOnline) {
            this.store.logger.warn('Device is offline');
            return;
        }

        if (this.isFault(data)) {
            this.store.logger.warn('Device fault detected, fetching error details');
            await this.store.saveValue('error', true);
            await this.updateDeviceDetails();
            await this.updateDeviceErrorMsg();
            return;
        }

        await this.store.saveValue('error', false);
        await this.store.saveValue('errorMessage', '');
        await this.store.saveValue('errorCode', '');
        await this.store.saveValue('errorLevel', 0);
        await this.updateDeviceDetails();
    }

    private isApiLevelLessThan3(): boolean {
        return this.store.apiLevel < 3;
    }

    private isOnline(data: { object_result?: { status?: string }; objectResult?: { status?: string } }): boolean {
        return (this.isApiLevelLessThan3() ? data.object_result?.status : data.objectResult?.status) === 'ONLINE';
    }

    private isFault(data: DeviceStatus): boolean {
        return !!(this.isApiLevelLessThan3()
            ? data.object_result?.is_fault
            : (data.objectResult?.is_fault ?? data.objectResult?.isFault));
    }

    public async updateDeviceDetails(): Promise<void> {
        const { product, logger } = this.store;
        const token = this.tokenManager.getValidTokenOrNull();
        if (!token || !product) {
            return;
        }

        try {
            const data = await this.apiClient.request<DeviceDetails>(
                this.store.getSUrlUpdateDeviceId(),
                this.getProtocolCodes(),
                token,
            );

            logger.debug(`Device details response: ${JSON.stringify(data)}`);

            const responseValue = data.object_result ?? data.objectResult;
            if (!responseValue || responseValue.length === 0) {
                return;
            }

            await this.store.saveValue('rawJSON', JSON.stringify(responseValue));

            const powerOn = findCodeVal(responseValue, 'Power') === '1';

            const mode = findCodeVal(responseValue, 'Mode');
            const modes = {
                0: 'R01', // Kühl-Modus (-> R01)
                1: 'R02', // Heiz-Modus (-> R02)
                2: 'R03', // Auto-Modus (-> R03)
            };
            const tempSetValue = findCodeVal(responseValue, 'Set_Temp');
            const tempSetValueByMode = mode
                ? findCodeVal(responseValue, modes[parseInt(mode) as keyof typeof modes])
                : null;

            await this.store.saveValue(
                'tempSet',
                this.getTempSetOverride(product, responseValue) ??
                    (tempSetValueByMode ? parseFloat(tempSetValueByMode) : null) ??
                    (tempSetValue ? parseFloat(tempSetValue) : null),
            );

            await this.saveSensors(responseValue);

            await this.store.saveValue('silent', findCodeVal(responseValue, 'Manual-mute') === '1');
            await this.store.saveValue('state', powerOn);
            await this.store.saveValue('mode', powerOn && mode ? parseInt(mode) : -1);
            await this.store.saveValue('info.connection', true);
            await this.store.saveValue('online', true);
        } catch (error) {
            throw new ResetError('Error updateDeviceDetails', {
                cause: error,
                sendToSentry: !(error instanceof ApiError),
            });
        }
    }

    private getTempSetOverride(product: string, responseValue: ObjectResultResponse): number | undefined {
        if (product === '1650758828508766208') {
            return parseFloatOrNull(findCodeVal(responseValue, 'R01'));
        }
        return undefined;
    }

    public async fetchDevice(): Promise<void> {
        const { logger } = this.store;
        const token = this.tokenManager.getValidTokenOrNull();
        if (!token) {
            return;
        }

        try {
            let data: UpdateDeviceId = {} as UpdateDeviceId;
            if (!this.apiType || this.apiType === 'default') {
                data = await this.apiClient.request<UpdateDeviceId>(
                    this.store.getUpdateDeviceIdSUrl(),
                    this.getAxiosUpdateDeviceIdParams(),
                    token,
                );
            }
            logger.debug(`Device list response: ${JSON.stringify(data)}`);
            let deviceCode = this.getDeviceCode(data);
            if (!deviceCode && (!this.apiType || this.apiType === 'legacy')) {
                logger.debug('No device found with default format, retrying with legacy format...');
                data = await this.apiClient.request<UpdateDeviceId>(
                    this.store.getUpdateDeviceIdSUrl(),
                    this.getAxiosUpdateDeviceIdParamsLegacy(),
                    token,
                );
                logger.debug(`Device list legacy response: ${JSON.stringify(data)}`);
                if (this.getDeviceCode(data)) {
                    this.apiType = 'legacy';
                }
            } else {
                this.apiType = 'default';
            }

            deviceCode = this.getDeviceCode(data);
            if (!deviceCode) {
                this.apiType = null;
                await this.store.resetDeviceOnly();
                logger.error(
                    `No device code found in API response. Check that the device is registered under this account and the product ID is in the supported list. Response: ${JSON.stringify(data?.object_result ?? data?.objectResult)}`,
                );
                return;
            }

            this.store.device = deviceCode;
            const productId = this.getProductId(data);
            this.store.product = productId;
            const isOnline = this.isDeviceStatusOnline(data);
            this.store.isOnline = isOnline;

            logger.info(`Device found: ${deviceCode} (product: ${productId}, online: ${isOnline})`);

            await this.store.saveValue('DeviceCode', deviceCode);
            await this.store.saveValue('ProductCode', productId);

            if (!isOnline) {
                logger.warn('Device is offline');
                await this.store.resetOnError();
                return;
            }
            await this.store.saveValue('info.connection', true);
            await this.store.saveValue('online', true);
            if (deviceCode != '' && productId) {
                await this.updateDeviceStatus();
            }
        } catch (error: any) {
            if (error instanceof ResetError) {
                throw error;
            }
            throw new ResetError(
                `fetchDevice failed (possible account conflict — check if the account is used elsewhere): ${error?.message ?? String(error)}`,
                { cause: error, sendToSentry: !(error instanceof ApiError) },
            );
        }
    }

    private getProductId(data: UpdateDeviceId): string | undefined {
        return data.object_result?.[0]?.product_id ?? data.objectResult?.[0]?.productId;
    }

    private getDeviceCode(data: UpdateDeviceId): string | undefined {
        return data?.object_result?.[0]?.device_code || data?.objectResult?.[0]?.deviceCode;
    }

    private isDeviceStatusOnline(data: UpdateDeviceId): boolean {
        return (data.object_result?.[0]?.device_status ?? data.objectResult?.[0]?.deviceStatus) === 'ONLINE';
    }

    public async updateDevicePower(mode: TMode): Promise<void> {
        const { logger } = this.store;

        const { powerOpt } = DeviceController.getPowerMode(mode);

        const res = this.getTokenAndDevice();
        if (!res) {
            logger.warn('Cannot send power command: no valid token or device available');
            return;
        }

        const data = await this.apiClient.request<MidasData>(
            this.store.getSUrl(),
            this.getAxiosUpdateDevicePowerParams(res.device, powerOpt, 'Power'),
            res.token,
        );

        logger.debug(`Power command response: ${JSON.stringify(data)}`);
        logger.info(`Power set to: ${mode === -1 ? 'OFF' : `ON (mode: ${mode})`}`);

        if (mode >= 0) {
            this.store.setMode(mode);
            await this.updateDeviceMode(mode);
        } else {
            await this.store.saveValue('mode', mode);
        }
    }

    public async updateDeviceSetTemp(temperature: number): Promise<void> {
        const { logger, adapter } = this.store;
        const numericTemperature =
            typeof temperature === 'number' ? temperature : parseFloat(String(temperature).replace(',', '.'));
        if (!Number.isFinite(numericTemperature)) {
            logger.warn(`Invalid set temperature: ${temperature}`);
            return;
        }
        const sTemperature = numericTemperature.toString().replace(',', '.');
        const result = await adapter.getStateAsync(this.store.getStateIdByKey('mode'));

        if (!isDefined(result?.val)) {
            logger.warn(`Skipping temperature update: current mode is invalid (${result?.val})`);
            return;
        }

        if (String(result?.val) === '-1') {
            logger.debug('Skipping temperature update: device is off (mode -1)');
            return;
        }
        const res = this.getTokenAndDevice();
        if (!res) {
            return;
        }
        const data = await this.apiClient.request<MidasData>(
            this.store.getSUrl(),
            this.getAxiosUpdateDeviceSetTempParams(res.device, sTemperature),
            res.token,
        );
        logger.debug(`Temperature command response: ${JSON.stringify(data)}`);
        logger.info(`Temperature set to: ${numericTemperature}°C`);

        await this.store.saveValue('tempSet', numericTemperature);
    }

    public async updateDeviceSilent(silent: boolean): Promise<void> {
        const { logger } = this.store;
        const silentMode = silent ? '1' : '0';
        const res = this.getTokenAndDevice();
        if (!res) {
            return;
        }
        const data = await this.apiClient.request<MidasData>(
            this.store.getSUrl(),
            this.getAxiosUpdateDevicePowerParams(res.device, silentMode, 'Manual-mute'),
            res.token,
        );

        logger.debug(`Silent command response: ${JSON.stringify(data)}`);
        logger.info(`Silent mode set to: ${silent}`);

        await this.store.saveValue('silent', silent);
    }

    private getAxiosUpdateDeviceSetTempParams(deviceCode: string, sTemperature: string): AxiosUpdateDeviceParams {
        return {
            param: ['R01', 'R02', 'R03', 'Set_Temp'].map(code => this.controlParam(deviceCode, code, sTemperature)),
        };
    }

    private getAxiosUpdateDeviceIdParams(): { product_ids?: string[]; productIds?: string[] } {
        return this.isApiLevelLessThan3() ? { product_ids: PRODUCT_IDS } : { productIds: PRODUCT_IDS };
    }

    private getAxiosUpdateDeviceIdParamsLegacy(): { body: { productIds: string[] } } {
        return { body: { productIds: PRODUCT_IDS } };
    }

    private getProtocolCodes(): {
        device_code?: string;
        deviceCode?: string;
        protocal_codes?: string[];
        protocalCodes?: string[];
    } {
        return this.isApiLevelLessThan3()
            ? { device_code: this.store.device, protocal_codes: CODES }
            : { deviceCode: this.store.device, protocalCodes: CODES };
    }

    private getAxiosUpdateDevicePowerParams(
        deviceCode: string,
        value: number | string,
        protocolCode: string,
    ): AxiosUpdateDeviceParams {
        return {
            param: [this.controlParam(deviceCode, protocolCode, value)],
        };
    }

    private controlParam = (
        deviceCode: string,
        protocolCode: string,
        value: string | number,
    ): AxiosUpdateDeviceParam => {
        return this.store.apiLevel < 3
            ? { device_code: deviceCode, protocol_code: protocolCode, value }
            : { deviceCode, protocolCode, value };
    };

    private async saveSensors(responseValue: ObjectResultResponse): Promise<void> {
        const sensorCodes = DeviceController.getSensorCodes();

        // T07 reports current (A); consumption (W) = current × voltage
        const currentVal = parseFloatOrNull(findValByCodeArray(responseValue, sensorCodes.tCurrent));
        const tVoltageVal = parseFloatOrNull(findValByCodeArray(responseValue, sensorCodes.tVoltage));

        await this.store.saveValue('consumption', currentVal * tVoltageVal);

        const flowSwitchValue = findValByCodeArray(responseValue, sensorCodes.flowSwitch);

        await this.saveSensorNumber('exhaust', responseValue, sensorCodes.exhaust);
        await this.saveSensorNumber('suctionTemp', responseValue, sensorCodes.tSuction);
        await this.saveSensorNumber('tempIn', responseValue, sensorCodes.tIn);
        await this.saveSensorNumber('tempOut', responseValue, sensorCodes.tOut);
        await this.saveSensorNumber('coilTemp', responseValue, sensorCodes.tCoil);
        await this.saveSensorNumber('ambient', responseValue, sensorCodes.tAmb);
        await this.saveNumberIfValid('voltage', tVoltageVal);
        await this.store.saveValue(
            'flowSwitch',
            flowSwitchValue ? [1, '1', 'true', true].includes(flowSwitchValue) : null,
        );
        await this.saveSensorNumber('rotor', responseValue, sensorCodes.tRotor, true);
    }

    private async saveSensorNumber(
        key: StateKey,
        res: ObjectResultResponse,
        code: string[],
        int?: boolean,
    ): Promise<void> {
        const val = findValByCodeArray(res, code);

        await this.saveNumberIfValid(key, int ? parseIntOrNull(val) : parseFloatOrNull(val));
    }

    private async updateDeviceErrorMsg(): Promise<void> {
        const { apiLevel, cloudURL } = this.store;
        const res = this.getTokenAndDevice();
        if (!res) {
            return;
        }
        const sURL =
            apiLevel < 3
                ? `${cloudURL}/app/device/getFaultDataByDeviceCode.json`
                : `${cloudURL}/app/device/getFaultDataByDeviceCode`;

        try {
            const data = await this.apiClient.request<MidasData>(
                sURL,
                {
                    device_code: res.device,
                    deviceCode: res.device,
                },
                res.token,
            );

            await this.store.saveValue('error', true);
            await this.store.saveValue(
                'errorMessage',
                data.objectResult?.[0]?.description ?? data.object_result?.[0]?.description ?? '',
            );
            await this.store.saveValue(
                'errorCode',
                data.objectResult?.[0]?.faultCode ?? data.object_result?.[0]?.fault_code,
            );
            await this.store.saveValue(
                'errorLevel',
                data.objectResult?.[0]?.errorLevel ?? data.object_result?.[0]?.error_level,
            );
        } catch (error: any) {
            throw new ResetError('UpdateDeviceErrorMsg', { cause: error, sendToSentry: !(error instanceof ApiError) });
        }
    }

    private async updateDeviceMode(mode: TMode): Promise<void> {
        const { logger } = this.store;

        const res = this.getTokenAndDevice();
        if (!res) {
            return;
        }
        const data = await this.apiClient.request<MidasData>(
            this.store.getSUrl(),
            this.getAxiosUpdateDevicePowerParams(res.device, mode, 'Mode'),
            res.token,
        );

        logger.debug(`Mode command response: ${JSON.stringify(data)}`);
        if (this.isSuccess(data)) {
            await this.store.saveValue('mode', mode);
        } else {
            logger.error(`Failed to set mode ${mode}: API reported no success`);
        }
    }

    private isSuccess(data: MidasData): boolean {
        return data.isReusltSuc;
    }

    private static getSensorCodes(): {
        tCurrent: string[];
        tSuction: string[];
        tIn: string[];
        tOut: string[];
        tCoil: string[];
        tAmb: string[];
        flowSwitch: string[];
        tVoltage: string[];
        tRotor: string[];
        exhaust: string[];
    } {
        return {
            tSuction: ['T01', 'T1'],
            tIn: ['T02', 'T2'],
            tOut: ['T03', 'T3'],
            tCoil: ['T04', 'T4'],
            tAmb: ['T05', 'T5'],
            exhaust: ['T06', 'T6'],
            tCurrent: ['T07', 'T7'],
            flowSwitch: ['S03', 'S3'],
            tVoltage: ['T14'],
            tRotor: ['T17'],
        };
    }

    private getTokenAndDevice(): { token: string; device: string } | null {
        const token = this.tokenManager.getValidTokenOrNull();
        const device = this.store.device;
        if (!token || !device) {
            return null;
        }
        return { token, device };
    }

    private async saveNumberIfValid(key: StateKey, value: number): Promise<boolean> {
        if (!Number.isFinite(value)) {
            return false;
        }
        await this.store.saveValue(key, value);
        return true;
    }

    public static getPowerMode(mode: TMode): { powerOpt: number; powerMode: number } {
        switch (mode) {
            case -1: // aus
                return {
                    powerOpt: 0,
                    powerMode: -1,
                };
            case 0: // an und kühlen
                return {
                    powerOpt: 1,
                    powerMode: 0,
                };
            case 1: // an und heizen
                return {
                    powerOpt: 1,
                    powerMode: 1,
                };
            case 2: // an und auto
                return {
                    powerOpt: 1,
                    powerMode: 2,
                };
            default:
                return { powerOpt: 0, powerMode: -1 };
        }
    }
}
