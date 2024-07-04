import { Command } from 'commander';

export function addAssetsCommand(program: Command) {
   return program
        .command('assets')
        .description('working with assets')
}