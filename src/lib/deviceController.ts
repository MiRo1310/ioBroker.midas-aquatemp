import { type StateKey, Store, type TMode } from './store';
import { getSUrl, getSUrlUpdateDeviceId, getUpdateDeviceIdSUrl, getUpdateDeviceStatusSUrl } from './endPoints';
import { request } from './axios';
import type { DeviceDetails, DeviceStatus, MidasData, UpdateDeviceId } from '../types/types';
import {
    getAxiosUpdateDeviceIdParams,
    getAxiosUpdateDevicePowerParams,
    getAxiosUpdateDeviceSetTempParams,
    getHeaders,
    getProtocolCodes,
} from './axiosParameter';
import { findCodeVal, isDefined, parseIntOrNull, parseNumberOrNull } from './utils';
import { errorLogger } from './logging';
import type { TokenManager } from './tokenManager';

export class DeviceController {
    constructor(
        private readonly store: Store,
        private readonly tokenManager: TokenManager,
    ) {}

    public async updateDeviceStatus(): Promise<void> {
        const { device: deviceCode, apiLevel, adapter, saveValue, resetOnErrorHandler } = this.store;
        try {
            const token = this.tokenManager.getValidTokenOrNull();
            if (!token || !deviceCode) {
                return;
            }

            const { sURL } = getUpdateDeviceStatusSUrl(this.store);

            const payload = apiLevel < 3 ? { device_code: deviceCode } : { deviceCode };

            const { data, error } = await request<DeviceStatus>(adapter, sURL, payload, getHeaders(token));
            if (!data || error) {
                await this.store.resetOnErrorHandler();
                return;
            }

            adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

            const status = apiLevel < 3 ? data.object_result?.status : data.objectResult?.status;
            const isReachable = status === 'ONLINE';
            this.store.reachable = isReachable;
            await saveValue('info.connection', isReachable);

            if (!isReachable) {
                return;
            }

            const isFault =
                apiLevel < 3
                    ? data.object_result?.is_fault
                    : (data.objectResult?.is_fault ?? data.objectResult?.isFault);
            if (isFault === true) {
                await saveValue('error', true);
                await this.updateDeviceDetails();
                await this.updateDeviceErrorMsg();
                return;
            }

            await saveValue('error', false);
            await saveValue('errorMessage', '');
            await saveValue('errorCode', '');
            await saveValue('errorLevel', 0);
            await this.updateDeviceDetails();
        } catch (error: unknown) {
            await resetOnErrorHandler();
            errorLogger('Error in updateDeviceStatus', error, adapter);
        }
    }

    public async updateDeviceDetails(): Promise<void> {
        const { device: deviceCode, product, resetOnErrorHandler, saveValue, adapter } = this.store;
        try {
            const token = this.tokenManager.getValidTokenOrNull();
            if (!token || !deviceCode || !product) {
                return;
            }

            const { sURL } = getSUrlUpdateDeviceId(this.store);

            const { data, error } = await request<DeviceDetails>(
                adapter,
                sURL,
                getProtocolCodes(this.store, product),
                getHeaders(token),
            );

            if (!data || error) {
                await resetOnErrorHandler();
                return;
            }

            adapter.log.debug(`DeviceDetails: ${JSON.stringify(data)}`);

            const responseValue = data.object_result ?? data.objectResult;
            if (!responseValue || responseValue.length === 0) {
                return;
            }

            await saveValue('rawJSON', JSON.stringify(responseValue));

            const isPoolsana = product === Store.AQUATEMP_POOLSANA;
            const powerOn = findCodeVal(responseValue, 'Power') === '1';

            const mode = findCodeVal(responseValue, 'Mode');
            const modes = {
                1: 'R02', // Heiz-Modus (-> R02)
                0: 'R01', // Kühl-Modus (-> R01)
                2: 'R03', // Auto-Modus (-> R03)
            };
            const tempSetValue = findCodeVal(responseValue, 'Set_Temp');
            const tempSetValueByMode = mode
                ? findCodeVal(responseValue, modes[parseInt(mode) as keyof typeof modes])
                : null;

            await saveValue(
                'tempSet',
                (tempSetValue ? parseFloat(tempSetValue) : null) ??
                    (tempSetValueByMode ? parseFloat(tempSetValueByMode) : null),
            );

            if (powerOn) {
                const tPower = isPoolsana ? 'T07' : 'T7';
                const tVoltage = 'T14';
                const tSuction = isPoolsana ? 'T01' : 'T1';
                const tIn = isPoolsana ? 'T02' : 'T2';
                const tOut = isPoolsana ? 'T03' : 'T3';
                const tCoil = isPoolsana ? 'T04' : 'T4';
                const tAmb = isPoolsana ? 'T05' : 'T5';
                const flowSwitch = isPoolsana ? 'S03' : 'S3';
                const tRotor = 'T17';

                const powerVal = parseNumberOrNull(findCodeVal(responseValue, tPower));
                const tVoltageVal = parseNumberOrNull(findCodeVal(responseValue, tVoltage));
                const consumptionValue = isDefined(powerVal) && isDefined(tVoltageVal) ? powerVal * tVoltageVal : 0;

                await saveValue('consumption', consumptionValue);

                const flowSwitchValue = findCodeVal(responseValue, flowSwitch);

                await this.saveNumberIfValid('suctionTemp', parseNumberOrNull(findCodeVal(responseValue, tSuction)));
                await this.saveNumberIfValid('tempIn', parseNumberOrNull(findCodeVal(responseValue, tIn)));
                await this.saveNumberIfValid('tempOut', parseNumberOrNull(findCodeVal(responseValue, tOut)));
                await this.saveNumberIfValid('coilTemp', parseNumberOrNull(findCodeVal(responseValue, tCoil)));
                await this.saveNumberIfValid('ambient', parseNumberOrNull(findCodeVal(responseValue, tAmb)));
                await this.saveNumberIfValid('voltage', tVoltageVal);
                await saveValue(
                    'flowSwitch',
                    flowSwitchValue ? [1, '1', 'true', true].includes(flowSwitchValue) : null,
                );
                await this.saveNumberIfValid('rotor', parseIntOrNull(findCodeVal(responseValue, tRotor)));
            } else {
                await saveValue('consumption', 0);
                await saveValue('rotor', 0);
            }

            await saveValue('silent', findCodeVal(responseValue, 'Manual-mute') === '1');
            await saveValue('state', powerOn);
            await saveValue('mode', powerOn && mode ? parseInt(mode) : -1);
            await saveValue('info.connection', true);
        } catch (error: unknown) {
            errorLogger('Error updateDeviceDetails', error, adapter);
            void resetOnErrorHandler();
        }
    }

    public async updateDeviceID(): Promise<void> {
        const { adapter, resetOnErrorHandler, saveValue } = this.store;
        try {
            const token = this.tokenManager.getValidTokenOrNull();
            if (!token) {
                return;
            }

            const { data, status, error } = await request<UpdateDeviceId>(
                adapter,
                getUpdateDeviceIdSUrl(this.store).sURL,
                getAxiosUpdateDeviceIdParams(this.store),
                getHeaders(token),
            );

            adapter.log.debug(`UpdateDeviceID response: ${JSON.stringify(data)}, status: ${status}`);

            if (!data || error) {
                await resetOnErrorHandler(); // Login-Fehler
                return;
            }

            if (!data?.object_result?.[0]?.device_code && !data?.objectResult?.[0]?.deviceCode) {
                await resetOnErrorHandler();
                adapter.log.error(
                    'No device code found. Maybe the token is not valid. Please check if there are not two usages of the same account. In the next loop the token will be refreshed.',
                );
                return;
            }
            const device = data.object_result?.[0].device_code ?? data.objectResult?.[0]?.deviceCode;
            this.store.device = device;
            const product = data.object_result?.[0]?.product_id ?? data.objectResult?.[0]?.productId ?? null;
            this.store.product = product;
            const isReachable =
                (data.object_result?.[0]?.device_status ?? data.objectResult?.[0]?.deviceStatus) == 'ONLINE';
            this.store.reachable = isReachable;

            adapter.log.debug(`device: ${device}, product: ${product}, reachable: ${isReachable}`);

            await saveValue('DeviceCode', device);
            await saveValue('ProductCode', product);

            if (!isReachable || !device) {
                adapter.log.debug('Device not reachable');
                void resetOnErrorHandler();
                return;
            }
            await saveValue('info.connection', true);
            if (device != '' && product) {
                await this.updateDeviceStatus();
            }
        } catch (error: any) {
            errorLogger('Error in updateDeviceID', error, adapter);
            await resetOnErrorHandler();
        }
    }

    public async updateDevicePower(mode: TMode): Promise<void> {
        const { adapter, device, resetOnErrorHandler, setMode, saveValue } = this.store;
        try {
            const { powerMode, powerOpt } = DeviceController.getPowerMode(mode);

            const token = this.tokenManager.getValidTokenOrNull();
            if (!isDefined(powerOpt) || !isDefined(powerMode) || !token || !device) {
                this.store.adapter.log.warn(`Invalid value(s) : ${mode}, ${token}, ${device}`);
                return;
            }

            const { sURL } = getSUrl(this.store);
            const { data, error } = await request<MidasData>(
                adapter,
                sURL,
                getAxiosUpdateDevicePowerParams(this.store, device, powerOpt, 'Power'),
                getHeaders(token),
            );
            if (!data || error) {
                await resetOnErrorHandler();
                return;
            }
            adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

            if (mode >= 0) {
                setMode(mode);
                await this.updateDeviceMode(mode);
            } else {
                await saveValue('mode', mode);
            }
        } catch (error: any) {
            errorLogger('Error in updateDevicePower', error, adapter);
        }
    }

    public async updateDeviceSetTemp(temperature: number): Promise<void> {
        const { adapter, device, getDpRoot, resetOnErrorHandler, saveValue } = this.store;
        try {
            const numericTemperature =
                typeof temperature === 'number' ? temperature : parseFloat(String(temperature).replace(',', '.'));
            if (!Number.isFinite(numericTemperature)) {
                adapter.log.warn(`Invalid set temperature: ${temperature}`);
                return;
            }
            const sTemperature = numericTemperature.toString().replace(',', '.');
            const result = await adapter.getStateAsync(`${getDpRoot()}.mode`);

            if (!result?.val) {
                adapter.log.warn(`Invalid mode: ${result?.val}`);
                return;
            }

            if (String(result?.val) === '-1') {
                adapter.log.debug(`Mode set to: ${result?.val}`);
                return;
            }
            const token = this.tokenManager.getValidTokenOrNull();
            if (token && device) {
                const { sURL } = getSUrl(this.store);

                const { data, error } = await request<MidasData>(
                    adapter,
                    sURL,
                    getAxiosUpdateDeviceSetTempParams(device, sTemperature, this.store),
                    getHeaders(token),
                );
                adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

                if (error) {
                    await resetOnErrorHandler();
                    return;
                }

                await saveValue('tempSet', numericTemperature);
            }
        } catch (error: any) {
            errorLogger('Error in updateDeviceSetTemp', error, adapter);
        }
    }

    public async updateDeviceSilent(silent: boolean): Promise<void> {
        const { adapter, device, resetOnErrorHandler, saveValue } = this.store;
        try {
            const silentMode = silent ? '1' : '0';
            const token = this.tokenManager.getValidTokenOrNull();
            if (token && device) {
                const { data, error } = await request<MidasData>(
                    adapter,
                    getSUrl(this.store).sURL,
                    getAxiosUpdateDevicePowerParams(this.store, device, silentMode, 'Manual-mute'),
                    getHeaders(token),
                );
                if (!data || error) {
                    await resetOnErrorHandler();
                    return;
                }

                adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

                await saveValue('silent', silent);
            }
        } catch (error: any) {
            errorLogger('Error in updateDeviceSilent', error, adapter);
        }
    }

    private async updateDeviceErrorMsg(): Promise<void> {
        const { adapter, apiLevel, cloudURL, device: deviceCode, resetOnErrorHandler, saveValue } = this.store;
        try {
            const token = this.tokenManager.getValidTokenOrNull();
            if (!token) {
                return;
            }
            const sURL =
                apiLevel < 3
                    ? `${cloudURL}/app/device/getFaultDataByDeviceCode.json`
                    : `${cloudURL}/app/device/getFaultDataByDeviceCode`;

            const { data, error } = await request<MidasData>(
                adapter,
                sURL,
                {
                    device_code: deviceCode,
                    deviceCode: deviceCode,
                },
                getHeaders(token),
            );

            if (!data || error) {
                await resetOnErrorHandler();
                return;
            }

            await saveValue('error', true);
            await saveValue(
                'errorMessage',
                data.objectResult?.[0]?.description ?? data.object_result?.[0]?.description ?? '',
            );
            await saveValue('errorCode', data.objectResult?.[0]?.faultCode ?? data.object_result?.[0]?.fault_code);
            await saveValue('errorLevel', data.objectResult?.[0]?.errorLevel ?? data.object_result?.[0]?.error_level);
        } catch (error: any) {
            errorLogger('Error in updateDeviceErrorMsg', error, adapter);
        }
    }

    private async updateDeviceMode(mode: TMode): Promise<void> {
        const { adapter, device, resetOnErrorHandler, saveValue } = this.store;

        try {
            const token = this.tokenManager.getValidTokenOrNull();
            if (token && device) {
                const { sURL } = getSUrl(this.store);
                const { data, error } = await request<MidasData>(
                    adapter,
                    sURL,
                    getAxiosUpdateDevicePowerParams(this.store, device, mode, 'Mode'),
                    {
                        headers: { 'x-token': token },
                    },
                );
                if (!data || error) {
                    await resetOnErrorHandler();
                    return;
                }
                adapter.log.debug(`DeviceStatus: ${JSON.stringify(data)}`);

                await saveValue('mode', mode);
            }
        } catch (error: any) {
            errorLogger('Error in updateDeviceMode', error, adapter);
        }
    }

    private async saveNumberIfValid(key: StateKey, value: number): Promise<boolean> {
        if (!Number.isFinite(value)) {
            return false;
        }
        await this.store.saveValue(key, value);
        return true;
    }

    private static getPowerMode(mode: TMode): {
        powerOpt: number | null;
        powerMode: number | null;
    } {
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
                return { powerOpt: null, powerMode: null };
        }
    }
}
