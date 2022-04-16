import { rmSync, cpSync, watch, existsSync } from 'fs';
import { resolve } from 'path';
import log from './log.mjs';

export class SyncQueue extends Set {
    constructor(source, target) {
        super();
        this.source = source;
        this.target = target;
    }

    add(value) {
        super.add(value);
        this.tick();
    }

    clear() {
        super.clear();
        this.handler = undefined;
    }

    tick() {
        clearTimeout(this.handler);
        this.handler = setTimeout(() => {
            this.forEach(item => {
                const a = resolve(this.source, item);
                const b = resolve(this.target, item);
                if (existsSync(a)) {
                    cpSync(a, b);
                } else {
                    rmSync(b, { force: true });
                }
                log('Synced', a, '->', b);
            });
            this.clear();
        }, 300);
    }

    init() {
        if (existsSync(this.target)) {
            log('The destination exists and will be deleted before syncing');
            rmSync(this.target, { recursive: true, force: true });
        }

        log('Starting file sync from source to destination');
        cpSync(this.source, this.target, { recursive: true });
        log('Synced', this.source, '->', this.target);

        log('Waiting for changes');
        watch(this.source, { recursive: true }, (event, file) => {
            this.add(file);
        });
    }
}
