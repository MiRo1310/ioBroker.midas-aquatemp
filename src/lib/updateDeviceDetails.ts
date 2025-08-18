import type { Modes } from '../types';
import { getHeaders, getProtocolCodes } from './axiosParameter';
import { getSUrlUpdateDeviceId } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';
import { request } from './axios';
import type { DeviceDetails, ObjectResultResponse } from '../types/types';

export const numberToBoolean = (value: string): boolean => {
    return value === '1';
};

const saveValues = async (adapter: MidasAquatemp, value: any): Promise<void> => {
    // Stromverbrauch T07 x T14 in Watt
    await saveValue({
        key: 'consumption',
        value: parseFloat(findCodeVal(value, ['T07', 'T7'])) * parseFloat(findCodeVal(value, 'T14')),
        stateType: 'number',
        adapter: adapter,
    });
    // Luftansaug-Temperatur T01
    await saveValue({
        key: 'suctionTemp',
        value: parseFloat(findCodeVal(value, ['T01', 'T1'])),
        stateType: 'number',
        adapter: adapter,
    });
    // Inlet-Temperatur T02
    await saveValue({
        key: 'tempIn',
        value: parseFloat(findCodeVal(value, ['T02', 'T2'])),
        stateType: 'number',
        adapter: adapter,
    });
    // outlet-Temperatur T03
    await saveValue({
        key: 'tempOut',
        value: parseFloat(findCodeVal(value, ['T03', 'T3'])),
        stateType: 'number',
        adapter: adapter,
    });
    // Coil-Temperatur T04
    await saveValue({
        key: 'coilTemp',
        value: parseFloat(findCodeVal(value, ['T04', 'T4'])),
        stateType: 'number',
        adapter: adapter,
    });
    // Umgebungs-Temperatur T05
    await saveValue({
        key: 'ambient',
        value: parseFloat(findCodeVal(value, ['T05', 'T5'])),
        stateType: 'number',
        adapter: adapter,
    });
    // Kompressorausgang-Temperatur T06
    await saveValue({
        key: 'exhaust',
        value: parseFloat(findCodeVal(value, ['T06', 'T6'])),
        stateType: 'number',
        adapter: adapter,
    });
    // Strömungsschalter S03
    await saveValue({
        key: 'flowSwitch',
        value: numberToBoolean(findCodeVal(value, ['S03', 'S3'])),
        stateType: 'boolean',
        adapter: adapter,
    });
    // Lüfter-Drehzahl T17
    await saveValue({
        key: 'rotor',
        value: parseInt(findCodeVal(value, 'T17')),
        stateType: 'number',
        adapter: adapter,
    });
};

export async function updateDeviceDetails(adapter: MidasAquatemp): Promise<void> {
    const store = initStore();
    try {
        const { token, device: deviceCode } = store;
        if (!token || !deviceCode) {
            return;
        }

        const { sURL } = getSUrlUpdateDeviceId();

        const { data, error } = await request<DeviceDetails>(
            adapter,
            sURL,
            getProtocolCodes(deviceCode),
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
            adapter: adapter,
        });
        await saveValues(adapter, responseValue);

        const mode = findCodeVal(responseValue, 'Mode');
        const modes: Modes = {
            1: 'R02', // Heiz-Modus (-> R02)
            0: 'R01', // Kühl-Modus (-> R01)
            2: 'R03', // Auto-Modus (-> R03)
        };

        await saveValue({
            key: 'tempSet',
            value: parseFloat(findCodeVal(responseValue, modes[mode])),
            stateType: 'number',
            adapter: adapter,
        });

        await saveValue({
            key: 'silent',
            value: findCodeVal(responseValue, 'Manual-mute') == '1',
            stateType: 'boolean',
            adapter: adapter,
        });

        const powerOpt = findCodeVal(responseValue, 'Power') === '1';

        await saveValue({ key: 'state', value: powerOpt, stateType: 'boolean', adapter: adapter });
        await saveValue({
            key: 'mode',
            value: powerOpt ? findCodeVal(responseValue, 'Mode') : '-1',
            stateType: 'string',
            adapter: adapter,
        });

        await saveValue({ key: 'info.connection', value: true, stateType: 'boolean', adapter: adapter });
    } catch (error: any) {
        errorLogger('Error updateDeviceDetails', error, adapter);
    }
}

function findCodeVal(result: ObjectResultResponse, code: string | string[]): string {
    if (!Array.isArray(code)) {
        return result.find(item => item.code === code)?.value || '';
    }
    for (let i = 0; i < code.length; i++) {
        const val = result.find(item => item.code === code[i])?.value;
        if (val && val !== '0' && val !== '') {
            return val;
        }
    }
    return '';
}
