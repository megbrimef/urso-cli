import { Command } from 'commander';
import { preSubcommandHookGenerator } from './preSubcommandHook';

const hooks = [
    preSubcommandHookGenerator()
];

export function addHooks(program: Command) {
    hooks.forEach(({ name, func }) => program.hook(name, func));
}