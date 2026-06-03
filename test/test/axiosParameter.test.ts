import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import {
    getAxiosUpdateDeviceIdParams,
    getAxiosUpdateDevicePowerParams,
    getAxiosUpdateDeviceSetTempParams,
    getHeaders,
    getProtocolCodes,
} from '../../src/lib/axiosParameter.ts';
import { Store } from '../../src/lib/store.ts';
import type { MidasAquatemp } from '../../src/main.ts';

const mockAdapter = {
    setObjectNotExists: async () => {},
    setState: async () => {},
    log: { warn: () => {}, error: () => {}, info: () => {}, debug: () => {}, silly: () => {} },
} as unknown as MidasAquatemp;

describe('axiosParameter.ts', () => {
    let storeV3: Store;
    let storeV2: Store;

    beforeEach(() => {
        storeV3 = new Store(mockAdapter, 'user', 'pass', 0, undefined, 3);
        storeV3.device = 'DEVICE_CODE_123';

        storeV2 = new Store(mockAdapter, 'user', 'pass', 0, undefined, 2);
        storeV2.device = 'DEVICE_CODE_123';
    });

    describe('getProtocolCodes', () => {
        it('returns camelCase keys for API v3', () => {
            const result = getProtocolCodes(storeV3);
            expect(result).to.have.property('deviceCode', 'DEVICE_CODE_123');
            expect(result).to.have.property('protocalCodes');
            expect(result).to.not.have.property('device_code');
            expect(result).to.not.have.property('protocal_codes');
        });

        it('returns snake_case keys for API v2', () => {
            const result = getProtocolCodes(storeV2);
            expect(result).to.have.property('device_code', 'DEVICE_CODE_123');
            expect(result).to.have.property('protocal_codes');
            expect(result).to.not.have.property('deviceCode');
            expect(result).to.not.have.property('protocalCodes');
        });

        it('uses Poolsana-specific codes (T01, T02) for Poolsana product ID', () => {
            const result = getProtocolCodes(storeV3, Store.AQUATEMP_POOLSANA);
            expect(result.protocalCodes).to.include('T01');
            expect(result.protocalCodes).to.include('T02');
            expect(result.protocalCodes).to.not.include('T1');
            expect(result.protocalCodes).to.not.include('T2');
        });

        it('uses generic codes (T1, T2) for non-Poolsana product IDs', () => {
            const result = getProtocolCodes(storeV3, 'other-product-id');
            expect(result.protocalCodes).to.include('T1');
            expect(result.protocalCodes).to.include('T2');
            expect(result.protocalCodes).to.not.include('T01');
        });

        it('uses generic codes when no product ID is given', () => {
            const result = getProtocolCodes(storeV3);
            expect(result.protocalCodes).to.include('T1');
        });
    });

    describe('getAxiosUpdateDeviceIdParams', () => {
        it('returns productIds (camelCase) for API v3', () => {
            const result = getAxiosUpdateDeviceIdParams(storeV3);
            expect(result).to.have.property('productIds');
            expect(result).to.not.have.property('product_ids');
            expect(result.productIds).to.be.an('array').with.length.greaterThan(0);
        });

        it('returns product_ids (snake_case) for API v2', () => {
            const result = getAxiosUpdateDeviceIdParams(storeV2);
            expect(result).to.have.property('product_ids');
            expect(result).to.not.have.property('productIds');
            expect(result.product_ids).to.be.an('array').with.length.greaterThan(0);
        });
    });

    describe('getAxiosUpdateDevicePowerParams', () => {
        it('returns one param entry with camelCase fields for API v3', () => {
            const result = getAxiosUpdateDevicePowerParams(storeV3, 'DEV123', 1, 'Power');
            expect(result.param).to.have.length(1);
            expect(result.param[0]).to.deep.include({ deviceCode: 'DEV123', protocolCode: 'Power', value: 1 });
        });

        it('returns one param entry with snake_case fields for API v2', () => {
            const result = getAxiosUpdateDevicePowerParams(storeV2, 'DEV123', 1, 'Power');
            expect(result.param).to.have.length(1);
            expect(result.param[0]).to.deep.include({ device_code: 'DEV123', protocol_code: 'Power', value: 1 });
        });
    });

    describe('getAxiosUpdateDeviceSetTempParams', () => {
        it('returns 4 param entries for R01, R02, R03 and Set_Temp', () => {
            const result = getAxiosUpdateDeviceSetTempParams('DEV123', '25', storeV3);
            expect(result.param).to.have.length(4);
            const codes = result.param.map((p: any) => p.protocolCode);
            expect(codes).to.have.members(['R01', 'R02', 'R03', 'Set_Temp']);
        });

        it('sets the same temperature value on all protocol codes', () => {
            const result = getAxiosUpdateDeviceSetTempParams('DEV123', '25', storeV3);
            result.param.forEach((p: any) => {
                expect(p.value).to.equal('25');
            });
        });

        it('uses snake_case fields for API v2', () => {
            const result = getAxiosUpdateDeviceSetTempParams('DEV123', '25', storeV2);
            const codes = result.param.map((p: any) => p.protocol_code);
            expect(codes).to.have.members(['R01', 'R02', 'R03', 'Set_Temp']);
        });
    });

    describe('getHeaders', () => {
        it('returns x-token header with provided token', () => {
            expect(getHeaders('my-token-123')).to.deep.equal({ headers: { 'x-token': 'my-token-123' } });
        });
    });
});