import { Command, HookEvent } from 'commander';
import { getConfigCfgPath } from '../data/gameConfigData';
import { isFileExistsAsync } from '../shared/io';

type HookGenerator =  (
        thisCommand: Command,
        actionCommand: Command,
      ) => void | Promise<void>


export function preSubcommandHookGenerator(): { name: HookEvent, func: HookGenerator } {
    return {
        name: 'preSubcommand',
        func: async (program: Command, actionCommand: Command) => {
            const isConfigCreated = await isFileExistsAsync(getConfigCfgPath());
            const isNonInitCommand = actionCommand.name() !== 'init';

            if(!isConfigCreated && isNonInitCommand) {
                program.error('Main config file was not found. Please run `urso init` command.');
            }
        }
    };
};