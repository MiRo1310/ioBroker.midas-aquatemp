import { getHeaders, getProtocolCodes } from './axiosParameter';
import { getSUrlUpdateDeviceId } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';
import { request } from './axios';
import type { DeviceDetails } from '../types/types';
import { findCodeVal, isDefined, parseIntOrNull, parseNumber } from './utils';

async function saveNumberIfValid(adapter: MidasAquatemp, key: string, value: number): Promise<boolean> {
    if (!Number.isFinite(value)) {
        return false;
    }
    await saveValue({ key, value, stateType: 'number', adapter });
    return true;
}

export async function updateDeviceDetails(adapter: MidasAquatemp): Promise<void> {
    const store = initStore();
    try {
        const { token, device: deviceCode, product } = store;
        if (!token || !deviceCode) {
            return;
        }

        const { sURL } = getSUrlUpdateDeviceId();

        const { data, error } = await request<DeviceDetails>(
            adapter,
            sURL,
            getProtocolCodes(deviceCode, product),
            getHeaders(token),
        );

        if (!data || error) {
            store.resetOnErrorHandler();
            return;
        }

        adapter.log.debug(`DeviceDetails: ${JSON.stringify(data)}`);

        const responseValue = data.object_result ?? data.objectResult;
        if (!responseValue || responseValue.length === 0) {
            return;
        }

        await saveValue({
            key: 'rawJSON',
            value: JSON.stringify(responseValue),
            stateType: 'string',
            adapter,
        });

        const isPoolsana = product === store.AQUATEMP_POOLSANA;
        const powerOn = findCodeVal(responseValue, 'Power') === '1';

        if (powerOn) {
            const tPower = isPoolsana ? 'T07' : 'T7';
            const tAmp = 'T14';
            const tSuction = isPoolsana ? 'T01' : 'T1';
            const tIn = isPoolsana ? 'T02' : 'T2';
            const tOut = 'T03';
            const tCoil = isPoolsana ? 'T04' : 'T4';
            const tAmb = isPoolsana ? 'T05' : 'T5';
            const flowSwitch = isPoolsana ? 'S03' : 'S3';

            const powerVal = parseNumber(findCodeVal(responseValue, tPower));
            const ampVal = parseNumber(findCodeVal(responseValue, tAmp));
            const consumptionValue = isDefined(powerVal) && isDefined(ampVal) ? powerVal * ampVal : 0;

            await saveValue({
                key: 'consumption',
                value: consumptionValue,
                stateType: 'number',
                adapter,
            });

            const flowSwitchValue = findCodeVal(responseValue, flowSwitch);

            await saveNumberIfValid(adapter, 'suctionTemp', parseNumber(findCodeVal(responseValue, tSuction)));
            await saveNumberIfValid(adapter, 'tempIn', parseNumber(findCodeVal(responseValue, tIn)));
            await saveNumberIfValid(adapter, 'tempOut', parseNumber(findCodeVal(responseValue, tOut)));
            await saveNumberIfValid(adapter, 'coilTemp', parseNumber(findCodeVal(responseValue, tCoil)));
            await saveNumberIfValid(adapter, 'ambient', parseNumber(findCodeVal(responseValue, tAmb)));
            await saveNumberIfValid(adapter, 'voltage', ampVal);
            await saveValue({
                key: 'flowSwitch',
                value: flowSwitchValue ? [1, '1', 'true', true].includes(flowSwitchValue) : null,
                stateType: 'boolean',
                adapter,
            });
            await saveNumberIfValid(adapter, 'rotor', parseIntOrNull(findCodeVal(responseValue, 'T17')));
        } else {
            await saveValue({ key: 'consumption', value: 0, stateType: 'number', adapter });
            await saveValue({ key: 'rotor', value: 0, stateType: 'number', adapter });
        }

        const setTempCandidates = ['Set_Temp', 'R02', 'R03', 'R01'];
        let setTempValue = 0;
        for (const code of setTempCandidates) {
            setTempValue = parseNumber(findCodeVal(responseValue, code));
            if (setTempValue !== null) {
                if (code !== 'Set_Temp') {
                    adapter.log.debug(`Set-temp fallback: ${code}=${setTempValue}`);
                }
                break;
            }
        }
        await saveNumberIfValid(adapter, 'tempSet', setTempValue);

        await saveValue({
            key: 'silent',
            value: findCodeVal(responseValue, 'Manual-mute') === '1',
            stateType: 'boolean',
            adapter,
        });

        await saveValue({ key: 'state', value: powerOn, stateType: 'boolean', adapter });
        await saveValue({
            key: 'mode',
            value: powerOn ? findCodeVal(responseValue, 'Mode') : '-1',
            stateType: 'string',
            adapter,
        });

        await saveValue({ key: 'info.connection', value: true, stateType: 'boolean', adapter });
    } catch (error: unknown) {
        errorLogger('Error updateDeviceDetails', error, adapter);
        store.resetOnErrorHandler();
    }
}
