#!/usr/bin/env node
import { Command, program } from 'commander';
import { getConfigCfgPath } from './data/gameConfigData';
import { runSafeAsync } from './shared/helpers';
import { isFileExistsAsync } from './shared/io';

runSafeAsync(async() => await runAppAsync())

async function runAppAsync() {
    program
        .name('urso')
        .version('0.0.1')
        .executableDir('./commands')
        .command('init', 'create general game config', { executableFile: 'init.js' })
        .command('assets', 'working with assets', { executableFile: 'assets.js' })
        .hook('preSubcommand', async (_: Command, actionCommand: Command) => {
            if(!await isFileExistsAsync(getConfigCfgPath()) && actionCommand.name() !== 'init') {
                program.error('Main config file was not found. Please run `urso init` command.');
            }
        });
    await program.parseAsync();
}