#!/usr/bin/env node
import {createCommand} from 'commander';
import { logInfo, logSuccess, logWarning } from '../shared/logger';
import {getConfigCfgPath} from '../data/gameConfigData';
import {stringify} from '../shared/helpers';
import {GameConfig} from '../shared/interfaces/GameConfig';
import {isFileExistsAsync, writeFileAsync} from '../shared/io';

const cmd = createCommand('init')
    .option('-f', 'force init',)
    .parse();

const {f: force} = cmd.opts();

const config: GameConfig = {
    general: {
        sourceFolder: 'src/assets',
        outputFolder: 'src/bin'
    },
    copy: {
        "images/spines": "images/spines",
        "fonts": "fonts"
    }
};

(async () => {
    logInfo(`Creating urso config file`);

    const cliCfgPath = getConfigCfgPath();

    if (force || !await isFileExistsAsync(cliCfgPath)) {
        await createConfigFile(cliCfgPath, config);
        logSuccess(`General config file created`);
        return;
    }

    logWarning('Urso config file already exists');
})();

async function createConfigFile(filePath: string, config: GameConfig): Promise<void> {
    await writeFileAsync(filePath, stringify(config));
}