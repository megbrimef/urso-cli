#!/usr/bin/env node
import { Command, program } from 'commander';
import { getConfigCfgPath } from './data/gameConfigData';
import { runSafeAsync } from './shared/helpers';
import { isFileExistsAsync } from './shared/io';
import { greet, logError } from './shared/logger';

greet('URSO CLI TOOL');
(async () => await runSafeAsync(async() => await runAppAsync()))();

async function runAppAsync() {
    program
        .name('urso')
        .version('0.2.1')
        .executableDir('./commands')
        .command('init', 'create general game config', { executableFile: 'init.js' })
        .command('assets', 'working with assets', { executableFile: 'assets.js' })
        .hook('preSubcommand', async (_: Command, actionCommand: Command) => {
            if(!await isFileExistsAsync(getConfigCfgPath()) && actionCommand.name() !== 'init') {
                logError('Main config file was not found. Please run `urso init` command.');
            }
        });
    await program.parseAsync();
}