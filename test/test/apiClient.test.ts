import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import { ApiClient } from '../../src/lib/apiClient.ts';
import { Store } from '../../src/lib/store.ts';
import type { MidasAquatemp } from '../../src/main.ts';
import { utils } from '@iobroker/testing';

const { adapter } = utils.unit.createMocks({});

describe('ApiClient', () => {
    let store: Store;
    let apiClient: ApiClient;

    beforeEach(() => {
        store = new Store(adapter as unknown as MidasAquatemp, 'user@test.com', 'pass', 0);
        apiClient = new ApiClient(store);
    });

    describe('isApiSuccess', () => {
        it('treats undefined and null as success', () => {
            expect(ApiClient.isApiSuccess(undefined)).to.be.true;
            expect(ApiClient.isApiSuccess(null as any)).to.be.true;
        });

        it('treats error_code 0 as success', () => {
            expect(ApiClient.isApiSuccess(0)).to.be.true;
            expect(ApiClient.isApiSuccess('0')).to.be.true;
        });

        it('treats non-zero codes as failure', () => {
            expect(ApiClient.isApiSuccess(1)).to.be.false;
            expect(ApiClient.isApiSuccess('5')).to.be.false;
        });

        it('treats non-numeric strings as failure', () => {
            expect(ApiClient.isApiSuccess('abc')).to.be.false;
        });
    });
});