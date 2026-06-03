import { createHash } from 'crypto';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';

import { Store } from '../../src/lib/store.ts';
import type { MidasAquatemp } from '../../src/main.ts';

const mockAdapter = {
    setObjectNotExists: async () => {},
    setState: async () => {},
    log: { warn: () => {}, error: () => {}, info: () => {}, debug: () => {}, silly: () => {} },
} as unknown as MidasAquatemp;

describe('Store', () => {
    let store: Store;

    beforeEach(() => {
        store = new Store(mockAdapter, 'user@test.com', 'password123', 0);
    });

    describe('getDpRoot', () => {
        it('returns correct data point root path for instance 0', () => {
            expect(store.getDpRoot()).to.equal('midas-aquatemp.0');
        });

        it('includes instance number in the path', () => {
            const s = new Store(mockAdapter, 'user', 'pass', 5);
            expect(s.getDpRoot()).to.equal('midas-aquatemp.5');
        });
    });

    describe('encryptedPassword', () => {
        it('stores password as MD5 hash', () => {
            const expected = createHash('md5').update('password123').digest('hex');
            expect(store.encryptedPassword).to.equal(expected);
        });

        it('produces a 32-character hex string', () => {
            expect(store.encryptedPassword).to.match(/^[a-f0-9]{32}$/);
        });

        it('different passwords produce different hashes', () => {
            const s1 = new Store(mockAdapter, 'user', 'pass1', 0);
            const s2 = new Store(mockAdapter, 'user', 'pass2', 0);
            expect(s1.encryptedPassword).to.not.equal(s2.encryptedPassword);
        });
    });

    describe('setMode / getMode', () => {
        it('defaults to mode 2 (auto)', () => {
            expect(store.getMode()).to.equal(2);
        });

        it('returns the mode that was set', () => {
            store.setMode(-1);
            expect(store.getMode()).to.equal(-1);

            store.setMode(0);
            expect(store.getMode()).to.equal(0);

            store.setMode(1);
            expect(store.getMode()).to.equal(1);
        });
    });

    describe('isValidMode', () => {
        it('returns true for all valid modes (-1, 0, 1, 2)', () => {
            expect(store.isValidMode(-1)).to.be.true;
            expect(store.isValidMode(0)).to.be.true;
            expect(store.isValidMode(1)).to.be.true;
            expect(store.isValidMode(2)).to.be.true;
        });

        it('returns false for invalid modes', () => {
            expect(store.isValidMode(3)).to.be.false;
            expect(store.isValidMode(-2)).to.be.false;
            expect(store.isValidMode(99)).to.be.false;
        });
    });

    describe('constructor defaults', () => {
        it('applies default interval of 60000ms', () => {
            expect(store.interval).to.equal(60000);
        });

        it('applies default apiLevel 3', () => {
            expect(store.apiLevel).to.equal(3);
        });

        it('applies custom interval', () => {
            const s = new Store(mockAdapter, 'u', 'p', 0, 30000);
            expect(s.interval).to.equal(30000);
        });

        it('applies custom apiLevel', () => {
            const s = new Store(mockAdapter, 'u', 'p', 0, undefined, 2);
            expect(s.apiLevel).to.equal(2);
        });

        it('sets device from deviceMac when useDeviceMac is true', () => {
            const mac = 'AA:BB:CC:DD:EE:FF';
            const s = new Store(mockAdapter, 'u', 'p', 0, undefined, 3, true, mac);
            expect(s.device).to.equal(mac);
            expect(s.useDeviceMac).to.be.true;
        });

        it('ignores deviceMac when useDeviceMac is false', () => {
            const s = new Store(mockAdapter, 'u', 'p', 0, undefined, 3, false, 'AA:BB:CC');
            expect(s.device).to.be.undefined;
        });
    });

    describe('resetOnErrorHandler', () => {
        it('clears token, device and reachable flag', async () => {
            store.token = 'some-token';
            store.device = 'device-123';
            store.reachable = true;

            await store.resetOnErrorHandler();

            expect(store.token).to.be.null;
            expect(store.device).to.equal('');
            expect(store.reachable).to.be.false;
        });
    });
});