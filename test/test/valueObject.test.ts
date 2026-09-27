import { createHash } from 'node:crypto';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Password } from '../../src/lib/valueObject.ts';

const md5 = (value: string): string => createHash('md5').update(value).digest('hex');

describe('Password', () => {
    describe('create', () => {
        it('returns a Password instance for a non-empty string', () => {
            expect(Password.create('password123')).to.be.instanceOf(Password);
        });

        it('returns undefined for an empty string', () => {
            expect(Password.create('')).to.be.undefined;
        });

        it('returns undefined for non-string values', () => {
            for (const value of [undefined, null, 123, true, {}, []]) {
                expect(Password.create(value), JSON.stringify(value)).to.be.undefined;
            }
        });

        it('accepts a whitespace-only password (not trimmed on purpose)', () => {
            expect(Password.create(' ')?.hashed).to.equal(md5(' '));
        });
    });

    describe('hashed', () => {
        it('is the MD5 hash of the plaintext', () => {
            expect(Password.create('password123')?.hashed).to.equal(md5('password123'));
        });

        it('is a 32-character lowercase hex string', () => {
            expect(Password.create('password123')?.hashed).to.match(/^[a-f0-9]{32}$/);
        });

        it('is identical for the same plaintext', () => {
            expect(Password.create('pass1')?.hashed).to.equal(Password.create('pass1')?.hashed);
        });

        it('differs for different plaintexts', () => {
            expect(Password.create('pass1')?.hashed).to.not.equal(Password.create('pass2')?.hashed);
        });
    });

    describe('leak protection', () => {
        it('does not expose plaintext or hash via JSON.stringify', () => {
            const json = JSON.stringify({ password: Password.create('password123') });
            expect(json).to.not.include('password123');
            expect(json).to.not.include(md5('password123'));
        });
    });
});
