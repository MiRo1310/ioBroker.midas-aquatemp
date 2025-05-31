import axios from 'axios';
import type { Modes } from '../types';
import { getProtocolCodes } from './axiosParameter';
import { getSUrlUpdateDeviceId } from './endPoints';
import { saveValue } from './saveValue';
import { initStore } from './store';
import { errorLogger } from './logging';
import type { MidasAquatemp } from '../main';

export const numberToBoolean = (value: number): boolean => {
    return value === 1;
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
        const { apiLevel, token, device: deviceCode } = store;
        if (token) {
            const { sURL } = getSUrlUpdateDeviceId();

            const response = await axios.post(sURL, getProtocolCodes(deviceCode), {
                headers: { 'x-token': token },
            });
            store._this.log.debug(`DeviceDetails: ${JSON.stringify(response.data)}`);

            if (parseInt(response.data.error_code) == 0) {
                const responseValue = apiLevel < 3 ? response.data.object_result : response.data.objectResult;

                await saveValue({
                    key: 'rawJSON',
                    value: JSON.stringify(responseValue),
                    stateType: 'string',
                    adapter: adapter,
                });
                await saveValues(adapter, responseValue);

                const mode: number = findCodeVal(responseValue, 'Mode');
                const modes: Modes = {
                    1: 'R02', // Heiz-Modus (-> R02)
                    0: 'R01', // Kühl-Modus (-> R01)
                    2: 'R03', // Auto-Modus (-> R03)
                };
                // Ziel-Temperatur anhand Modus
                await saveValue({
                    key: 'tempSet',
                    value: parseFloat(findCodeVal(responseValue, modes[mode])),
                    stateType: 'number',
                    adapter: adapter,
                });

                // Flüstermodus Manual-mute
                await saveValue({
                    key: 'silent',
                    value: findCodeVal(responseValue, 'Manual-mute') == '1',
                    stateType: 'boolean',
                    adapter: adapter,
                });

                // Zustand Power
                if (findCodeVal(responseValue, 'Power') == '1') {
                    await saveValue({ key: 'state', value: true, stateType: 'boolean', adapter: adapter });
                    await saveValue({
                        key: 'mode',
                        value: findCodeVal(responseValue, 'Mode'),
                        stateType: 'string',
                        adapter: adapter,
                    });
                } else {
                    await saveValue({ key: 'state', value: false, stateType: 'boolean', adapter: adapter });
                    await saveValue({ key: 'mode', value: '-1', stateType: 'string', adapter: adapter });
                }

                await saveValue({ key: 'info.connection', value: true, stateType: 'boolean', adapter: adapter });
                return;
            }

            adapter.log.error(`Error: ${JSON.stringify(response.data)}`);
            store.resetOnErrorHandler();
            return;
        }
        return;
    } catch (error: any) {
        errorLogger('Error updateDeviceDetails', error, adapter);
    }
}

function findCodeVal(result: { value: string; code: string }[], code: string | string[]): any {
    if (!Array.isArray(code)) {
        return result.find(item => item.code === code)?.value || '';
    }
    for (let i = 0; i < code.length; i++) {
        const val = result.find(item => item.code === code[i])?.value;
        if (val !== '0') {
            return val;
        }
    }
    return '0';
}
