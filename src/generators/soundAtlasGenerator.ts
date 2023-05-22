const audiosprite = require('audiosprite');
import {promisify} from 'util';
import {getFilesListRecursiveOfTypeAsync, readFileAsync} from "../shared/io";
import {getGameConfigData} from "../data/gameConfigData";
import {CFG_TYPE} from "../shared/enums/assets";
import {getAbsolutePath, getAllConfigsOfType} from "../shared/helpers";
import {Config, SoundConfig} from "../shared/interfaces/GeneratorConfigs";
import {getSoundConfigs} from "./soundConfigGenerator";
import {FILE_TYPES} from "../shared/enums/fileTypes";
import { logInfo, logSuccess, logWarning } from '../shared/logger';

const audiospriteAsync = promisify(audiosprite);

export async function packSound(soundConfig: SoundConfig, sourceFolder: string, outputFolder: string) {
    const {srcFolder, optimization, destFolder, name} = soundConfig;
    const files = await getFilesListRecursiveOfTypeAsync(getAbsolutePath([sourceFolder, srcFolder]), [FILE_TYPES.M4A, FILE_TYPES.MP3, FILE_TYPES.OGG, FILE_TYPES.WAV]);
    const options = {
        ...optimization,
        output: getAbsolutePath([outputFolder, destFolder, name])
    };
    
    if(!files.length) {
        logWarning(`'${soundConfig.name}' no sound files was found!`);
        return;
    }

    await audiospriteAsync(files, options);
}

export async function packSounds(jsonPath: string) {
    const {general: {sourceFolder, outputFolder}} = await getGameConfigData();
    const fileData = await readFileAsync(jsonPath);
    const config = JSON.parse(fileData.toString()) as Config<SoundConfig>;
    const soundConfigs = getSoundConfigs(config);
    logInfo(`Packing audioatlas ${soundConfigs[0].name}`);
    await Promise.all(soundConfigs.map(async (soundConfig: SoundConfig) => await packSound(soundConfig, sourceFolder, outputFolder)));
    logSuccess(`Packing audioatlas ${soundConfigs[0].name} DONE`);
}

export async function packAllSounds(dirPath: string) {
    logInfo('Sound atlas pack starting');
    const allSoundConfigs = await getAllConfigsOfType(dirPath, [CFG_TYPE.SOUND]);
    await Promise.all(allSoundConfigs.map(async (jsonPath) => await packSounds(jsonPath)));
    logSuccess(`Sound atlas pack DONE`);
}