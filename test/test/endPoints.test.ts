import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { Store } from '../../src/lib/store.ts';
import type { MidasAquatemp } from '../../src/main.ts';
import { utils } from '@iobroker/testing';

const { adapter } = utils.unit.createMocks({});

describe('Store endpoint methods', () => {
    let storeV3: Store;
    let storeV2: Store;
    beforeEach(() => {
        storeV3 = new Store(adapter as unknown as MidasAquatemp, 'user@test.com', 'pass', 0, undefined, 3);
        storeV2 = new Store(adapter as unknown as MidasAquatemp, 'user@test.com', 'pass', 0, undefined, 2);
    });

    describe('cloudURL (set in constructor)', () => {
        it('sets v3 cloud URL with port 449 and crmservice path', () => {
            expect(storeV3.cloudURL).to.equal('https://cloud.linked-go.com:449/crmservice/api');
        });

        it('sets v2 cloud URL without port and with cloudservice path', () => {
            expect(storeV2.cloudURL).to.equal('https://cloud.linked-go.com/cloudservice/api');
        });
    });

    describe('getSUrl (device control)', () => {
        it('appends .json for API v2', () => {
            expect(storeV2.getSUrl()).to.match(/\/control\.json$/);
        });

        it('uses clean URL for API v3', () => {
            const url = storeV3.getSUrl();
            expect(url).to.match(/\/control$/);
            expect(url).to.not.include('.json');
        });
    });

    describe('getSUrlUpdateDeviceId (getDataByCode)', () => {
        it('appends .json for API v2', () => {
            expect(storeV2.getSUrlUpdateDeviceId()).to.match(/\/getDataByCode\.json$/);
        });

        it('uses clean URL for API v3', () => {
            const url = storeV3.getSUrlUpdateDeviceId();
            expect(url).to.match(/\/getDataByCode$/);
            expect(url).to.not.include('.json');
        });
    });

    describe('getUpdateDeviceStatusSUrl', () => {
        it('appends .json for API v2', () => {
            expect(storeV2.getUpdateDeviceStatusSUrl()).to.match(/\/getDeviceStatus\.json$/);
        });

        it('uses clean URL for API v3', () => {
            const url = storeV3.getUpdateDeviceStatusSUrl();
            expect(url).to.match(/\/getDeviceStatus$/);
            expect(url).to.not.include('.json');
        });
    });

    describe('getUpdateDeviceIdSUrl (deviceList)', () => {
        it('appends .json for API v2', () => {
            expect(storeV2.getUpdateDeviceIdSUrl()).to.match(/\/deviceList\.json$/);
        });

        it('uses clean URL for API v3', () => {
            const url = storeV3.getUpdateDeviceIdSUrl();
            expect(url).to.match(/\/deviceList$/);
            expect(url).to.not.include('.json');
        });
    });

    describe('getOptionsAndSUrl (login)', () => {
        it('uses user_name field and .json URL for API v2', () => {
            const { options, sUrl } = storeV2.getOptionsAndSUrl();
            expect(options).to.have.property('user_name', 'user@test.com');
            expect(options).to.not.have.property('userName');
            expect(sUrl).to.match(/\/login\.json$/);
        });

        it('uses userName field and clean URL for API v3', () => {
            const { options, sUrl } = storeV3.getOptionsAndSUrl();
            expect(options).to.have.property('userName', 'user@test.com');
            expect(options).to.not.have.property('user_name');
            expect(sUrl).to.match(/\/login$/);
            expect(sUrl).to.not.include('.json');
        });

        it('always sends encrypted password and type "2"', () => {
            const { options: v3Options } = storeV3.getOptionsAndSUrl();
            expect(v3Options.password).to.match(/^[a-f0-9]{32}$/);
            expect(v3Options.type).to.equal('2');

            const { options: v2Options } = storeV2.getOptionsAndSUrl();
            expect(v2Options.password).to.match(/^[a-f0-9]{32}$/);
            expect(v2Options.type).to.equal('2');
        });
    });
});
