import { readFileAsync } from '../shared/io';
import { cliDefaultConfig } from '../shared/interfaces/CliConfig';
import { resolve } from 'path';
import { GameConfig } from '../shared/interfaces/GameConfig';

let gameConfigData: GameConfig;

export async function getGameConfigData(): Promise<GameConfig> { 
    if(!gameConfigData) {
        const fileData = await (await readFileAsync(getConfigCfgPath())).toString();
        gameConfigData = JSON.parse(fileData);
    }

    return gameConfigData as GameConfig;
}

export function getConfigCfgPath() {
    return resolve(process.cwd(), cliDefaultConfig.baseCfgName);
}