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
    await saveValue(
        'consumption',
        parseFloat(findCodeVal(value, ['T07', 'T7'])) * parseFloat(findCodeVal(value, 'T14')),
        'number',
        adapter,
    );
    // Luftansaug-Temperatur T01
    await saveValue('suctionTemp', parseFloat(findCodeVal(value, ['T01', 'T1'])), 'number', adapter);
    // Inlet-Temperatur T02
    await saveValue('tempIn', parseFloat(findCodeVal(value, ['T02', 'T2'])), 'number', adapter);
    // outlet-Temperatur T03
    await saveValue('tempOut', parseFloat(findCodeVal(value, ['T03', 'T3'])), 'number', adapter);
    // Coil-Temperatur T04
    await saveValue('coilTemp', parseFloat(findCodeVal(value, ['T04', 'T4'])), 'number', adapter);
    // Umgebungs-Temperatur T05
    await saveValue('ambient', parseFloat(findCodeVal(value, ['T05', 'T5'])), 'number', adapter);
    // Kompressorausgang-Temperatur T06
    await saveValue('exhaust', parseFloat(findCodeVal(value, ['T06', 'T6'])), 'number', adapter);
    // Strömungsschalter S03
    await saveValue('flowSwitch', numberToBoolean(findCodeVal(value, ['S03', 'S3'])), 'boolean', adapter);
    // Lüfter-Drehzahl T17
    await saveValue('rotor', parseInt(findCodeVal(value, 'T17')), 'number', adapter);
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

                await saveValue('rawJSON', JSON.stringify(responseValue), 'string', adapter);
                await saveValues(adapter, responseValue);

                const mode: number = findCodeVal(responseValue, 'Mode');
                const modes: Modes = {
                    1: 'R02', // Heiz-Modus (-> R02)
                    0: 'R01', // Kühl-Modus (-> R01)
                    2: 'R03', // Auto-Modus (-> R03)
                };
                // Ziel-Temperatur anhand Modus
                await saveValue('tempSet', parseFloat(findCodeVal(responseValue, modes[mode])), 'number', adapter);

                // Flüstermodus Manual-mute
                await saveValue('silent', findCodeVal(responseValue, 'Manual-mute') == '1', 'boolean', adapter);

                // Zustand Power
                if (findCodeVal(responseValue, 'Power') == '1') {
                    await saveValue('state', true, 'boolean', adapter);
                    await saveValue('mode', findCodeVal(responseValue, 'Mode'), 'string', adapter);
                } else {
                    await saveValue('state', false, 'boolean', adapter);
                    await saveValue('mode', '-1', 'string', adapter);
                }

                await saveValue('info.connection', true, 'boolean', adapter);
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
