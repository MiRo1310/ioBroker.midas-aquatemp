import { createHash } from 'node:crypto';

export class Password {
    readonly #hashed: string;
    private constructor(hashed: string) {
        this.#hashed = hashed;
    }

    public static create(value: unknown): Password | undefined {
        if (typeof value !== 'string' || value === '') {
            return undefined;
        }
        return new Password(createHash('md5').update(value).digest('hex'));
    }

    public get hashed(): string {
        return this.#hashed;
    }
}
