import { getHeaders, getProtocolCodes } from './axiosParameter';
import { getSUrlUpdateDeviceId } from './endPoints';
import { errorLogger } from './logging';
import { request } from './axios';
import type { DeviceDetails } from '../types/types';
import { findCodeVal, isDefined, parseIntOrNull, parseNumberOrNull } from './utils';
import { Store, type StateKey } from './store';

async function saveNumberIfValid(store: Store, key: StateKey, value: number): Promise<boolean> {
    if (!Number.isFinite(value)) {
        return false;
    }
    await store.saveValue(key, value);
    return true;
}

export async function updateDeviceDetails(store: Store): Promise<void> {
    const adapter = store.adapter;
    try {
        const { token, device: deviceCode, product } = store;
        if (!token || !deviceCode || !product) {
            return;
        }

        const { sURL } = getSUrlUpdateDeviceId(store);

        const { data, error } = await request<DeviceDetails>(
            adapter,
            sURL,
            getProtocolCodes(store, product),
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

        await store.saveValue('rawJSON', JSON.stringify(responseValue));

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

        await store.saveValue(
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

            await store.saveValue('consumption', consumptionValue);

            const flowSwitchValue = findCodeVal(responseValue, flowSwitch);

            await saveNumberIfValid(store, 'suctionTemp', parseNumberOrNull(findCodeVal(responseValue, tSuction)));
            await saveNumberIfValid(store, 'tempIn', parseNumberOrNull(findCodeVal(responseValue, tIn)));
            await saveNumberIfValid(store, 'tempOut', parseNumberOrNull(findCodeVal(responseValue, tOut)));
            await saveNumberIfValid(store, 'coilTemp', parseNumberOrNull(findCodeVal(responseValue, tCoil)));
            await saveNumberIfValid(store, 'ambient', parseNumberOrNull(findCodeVal(responseValue, tAmb)));
            await saveNumberIfValid(store, 'voltage', tVoltageVal);
            await store.saveValue(
                'flowSwitch',
                flowSwitchValue ? [1, '1', 'true', true].includes(flowSwitchValue) : null,
            );
            await saveNumberIfValid(store, 'rotor', parseIntOrNull(findCodeVal(responseValue, tRotor)));
        } else {
            await store.saveValue('consumption', 0);
            await store.saveValue('rotor', 0);
        }

        await store.saveValue('silent', findCodeVal(responseValue, 'Manual-mute') === '1');

        await store.saveValue('state', powerOn);

        await store.saveValue('mode', powerOn && mode ? parseInt(mode) : -1);

        await store.saveValue('info.connection', true);
    } catch (error: unknown) {
        errorLogger('Error updateDeviceDetails', error, adapter);
        void store.resetOnErrorHandler();
    }
}
