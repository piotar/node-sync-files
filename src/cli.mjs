#!/usr/bin/env node

import { Command, InvalidArgumentError } from 'commander';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { SyncQueue } from './utils/SyncQueue.mjs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));

new Command()
    .name('sync-files')
    .description(packageJson.description)
    .version(packageJson.version)
    .argument('<source>', 'Source', (path) => {
        const source = resolve(process.cwd(), path);
        if (existsSync(source)) {
            return source;
        }
        throw new InvalidArgumentError('Path does not exists.');
    })
    .argument('<destination>', 'Destination', (path) => resolve(process.cwd(), path))
    .action((source, destination) => {
        new SyncQueue(source, destination).init();
    })
    .parse();
