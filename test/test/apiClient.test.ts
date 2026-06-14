import { expect } from 'chai';
import { beforeEach, afterEach, describe, it } from 'mocha';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import 'chai-as-promised';

import { ApiClient } from '../../src/lib/apiClient.ts';
import { Store } from '../../src/lib/store.ts';
import type { MidasAquatemp } from '../../src/main.ts';
import { utils } from '@iobroker/testing';

const { adapter } = utils.unit.createMocks({});

describe('ApiClient', () => {
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

        it('treats -100 (session expired) as failure', () => {
            expect(ApiClient.isApiSuccess(-100)).to.be.false;
            expect(ApiClient.isApiSuccess('-100')).to.be.false;
        });

        it('treats empty string as failure', () => {
            expect(ApiClient.isApiSuccess('')).to.be.false;
        });
    });

    describe('request', () => {
        let mock: MockAdapter;
        let store: Store;
        let client: ApiClient;
        const url = 'https://cloud.linked-go.com:449/crmservice/api/app/user/login';

        beforeEach(() => {
            mock = new MockAdapter(axios);
            store = new Store(adapter as unknown as MidasAquatemp, 'user', 'pass', 0);
            client = new ApiClient(store);
        });

        afterEach(() => {
            mock.restore();
        });

        it('returns data on HTTP 200 with error_code 0', async () => {
            const responseData = { error_code: '0', objectResult: { 'x-token': 'abc123' } };
            mock.onPost(url).reply(200, responseData);

            const result = await client.request(url, {});

            expect(result).to.deep.equal(responseData);
        });

        it('throws on HTTP 200 with non-zero error_code', async () => {
            mock.onPost(url).reply(200, { error_code: '-100', error_msg: 'please re-login' });

            await expect(client.request(url, {})).to.be.rejectedWith(Error, 'API error -100');
        });

        it('throws on HTTP 500', async () => {
            mock.onPost(url).reply(500, {});

            await expect(client.request(url, {})).to.be.rejectedWith(Error, 'Request failed with status code 500');
        });

        it('sends x-token header when token is provided', async () => {
            mock.onPost(url).reply(config => {
                const hasToken = config.headers?.['x-token'] === 'my-token';
                return [200, { error_code: '0', result: hasToken }];
            });

            const result = await client.request<any>(url, {}, 'my-token');

            expect(result.result).to.be.true;
        });

        it('sends no x-token header when token is omitted', async () => {
            mock.onPost(url).reply(config => {
                const hasToken = 'x-token' in (config.headers ?? {});
                return [200, { error_code: '0', result: hasToken }];
            });

            const result = await client.request<any>(url, {});

            expect(result.result).to.be.false;
        });

        it('throws when response body is empty', async () => {
            mock.onPost(url).reply(200, null);

            await expect(client.request(url, {})).to.be.rejectedWith(Error, 'No response returned');
        });

        it('sends request body as JSON', async () => {
            const payload = { userName: 'test', password: 'hash' };
            mock.onPost(url, payload).reply(200, { error_code: '0' });

            await expect(client.request(url, payload)).to.not.be.rejected;
        });
    });
});
