import type { MidasAquatemp } from '../main';

export class ConsecutiveErrorTracker {
    private errors: unknown[] = [];

    constructor(
        private cb: (e: any) => Promise<void>,
        private adapter: MidasAquatemp,
        private readonly acceptedErrors = 4,
    ) {}

    public async addError(e: any): Promise<void> {
        this.errors.push(e);
        this.adapter.log.debug(`Error message: ${e.message}`);
        this.adapter.log.debug(`Error stack: ${e.stack}`);
        if (this.errors.length > this.acceptedErrors) {
            await this.sendError(e);
            this.resetErrors();
        }
    }

    public resetErrors(): void {
        this.errors = [];
    }

    async sendError(error: any): Promise<void> {
        await this.cb(error);
    }
}
