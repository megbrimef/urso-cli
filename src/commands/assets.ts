#!/usr/bin/env node
import {createCommand} from 'commander';

createCommand('assets')
    .description('working with assets')
    .executableDir('./assets')
    .command('make', 'create config files', { executableFile: 'make.js' })
    .command('pack', 'create assets from configs', { executableFile: 'pack.js' })
    .parse();


