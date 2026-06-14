import type { MidasAquatemp } from '../main';
import { ApiError, ResetError } from './apiClient';

export class Logger {
    constructor(private readonly adapter: MidasAquatemp) {}

    public error(msg: string): void {
        this.adapter.log.error(msg);
    }

    public debug(msg: string): void {
        this.adapter.log.debug(msg);
    }

    public warn(msg: string): void {
        this.adapter.log.warn(msg);
    }

    public info(msg: string): void {
        this.adapter.log.info(msg);
    }

    private shouldSendToSentry(e: any): boolean {
        if (e instanceof ApiError) {
            return false;
        }
        if (e instanceof ResetError) {
            return e.sendToSentry;
        }
        return true;
    }

    public errorHandler(title: string, e: any, useSentry = true): void {
        if (useSentry && this.shouldSendToSentry(e)) {
            this.sendToSentry(e);
        }
        this.adapter.log.error(title);

        this.error(`Error message: ${e.message}`);
        this.error(`Error stack: ${e.stack}`);

        if (e?.response) {
            this.error(`Server response: ${e?.response?.status}`);
            this.error(`Server status: ${e?.response?.statusText}`);
        }
    }

    private sendToSentry(e: any): void {
        if (this.adapter.supportsFeature && this.adapter.supportsFeature('PLUGINS')) {
            const sentryInstance = this.adapter.getPluginInstance('sentry');
            if (sentryInstance) {
                sentryInstance.getSentryObject()?.captureException(e);
            }
        }
    }
}
