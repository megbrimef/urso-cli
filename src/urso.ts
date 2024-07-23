#!/usr/bin/env node

import { program } from 'commander';
import { runSafeAsync } from './shared/helpers';

import { addHooks } from './hooks';
import { addCommands } from './commands';

runSafeAsync(async () => await runAppAsync());

async function runAppAsync() {
    program
        .name('urso')
        .version('__APP_VERSION__');

    addHooks(program);
    addCommands(program)();
        
    await program.parseAsync();
}