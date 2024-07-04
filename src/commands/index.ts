import { Command } from 'commander';
import { addInitCommand } from './init';
import { addAssetsCommand } from './assets';
import { addMakeSubcommand } from './assets/make';
import { addPackSubcommand } from './assets/pack';

type CommandsGenerator = (program: Command) => Command;
type CommandsConfig = { generator: CommandsGenerator, subcommands?: CommandsConfig[] }

const commands: CommandsConfig [] = [
    { 
        generator: addInitCommand
    },
    { 
        generator: addAssetsCommand, 
        subcommands: [
            {
                generator: addMakeSubcommand
            },
            {
                generator: addPackSubcommand
            }
        ]
    }
];

export function addCommands(program: Command) {
    return function(cmds = commands) {
        cmds.forEach(({ generator, subcommands = [] }) => {
            const prog = generator(program);
            addCommands(prog)(subcommands);
        });
    }
}