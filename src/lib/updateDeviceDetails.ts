import { getHeaders, getProtocolCodes } from './axiosParameter';
import { getSUrlUpdateDeviceId } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';
import { request } from './axios';
import type { DeviceDetails } from '../types/types';
import { findCodeVal, isDefined, parseIntOrNull, parseNumberOrNull } from './utils';

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
            await store.resetOnErrorHandler();
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

        await saveValue({
            key: 'tempSet',
            value:
                (tempSetValue ? parseFloat(tempSetValue) : null) ??
                (tempSetValueByMode ? parseFloat(tempSetValueByMode) : null),
            stateType: 'number',
            adapter: adapter,
        });

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

            await saveValue({
                key: 'consumption',
                value: consumptionValue,
                stateType: 'number',
                adapter,
            });

            const flowSwitchValue = findCodeVal(responseValue, flowSwitch);

            await saveNumberIfValid(adapter, 'suctionTemp', parseNumberOrNull(findCodeVal(responseValue, tSuction)));
            await saveNumberIfValid(adapter, 'tempIn', parseNumberOrNull(findCodeVal(responseValue, tIn)));
            await saveNumberIfValid(adapter, 'tempOut', parseNumberOrNull(findCodeVal(responseValue, tOut)));
            await saveNumberIfValid(adapter, 'coilTemp', parseNumberOrNull(findCodeVal(responseValue, tCoil)));
            await saveNumberIfValid(adapter, 'ambient', parseNumberOrNull(findCodeVal(responseValue, tAmb)));
            await saveNumberIfValid(adapter, 'voltage', tVoltageVal);
            await saveValue({
                key: 'flowSwitch',
                value: flowSwitchValue ? [1, '1', 'true', true].includes(flowSwitchValue) : null,
                stateType: 'boolean',
                adapter,
            });
            await saveNumberIfValid(adapter, 'rotor', parseIntOrNull(findCodeVal(responseValue, tRotor)));
        } else {
            await saveValue({ key: 'consumption', value: 0, stateType: 'number', adapter });
            await saveValue({ key: 'rotor', value: 0, stateType: 'number', adapter });
        }

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
        void store.resetOnErrorHandler();
    }
}
