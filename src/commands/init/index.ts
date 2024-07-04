import { Command } from 'commander';
import { getConfigCfgPath } from '../../data/gameConfigData';
import { stringify } from '../../shared/helpers';
import { GameConfig } from '../../shared/interfaces/GameConfig';
import { isFileExistsAsync, writeFileAsync } from '../../shared/io';
import { defaultGameConfig } from './config';

async function action({ force }) {
    const cliCfgPath = getConfigCfgPath();

    if(force || !await isFileExistsAsync(cliCfgPath)) {
        await createConfigFile(cliCfgPath, defaultGameConfig);
        console.log('Urso config file was created');
        return;
    } 
    
    console.log('Urso config file already exists');
}

async function createConfigFile(filePath: string, config: GameConfig): Promise<void> {
    await writeFileAsync(filePath, stringify(config));
}

export function addInitCommand(program: Command): Command {
    return program
        .command('init')
        .description('create general game config')
        .option('-f, --force', 'force init')
        .action(action);
}