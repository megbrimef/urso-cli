import { getFilesListRecursiveOfTypeAsync, readFileAsync, writeFileAsync } from '../shared/io';
import { getGameConfigData } from '../data/gameConfigData';
import { CFG_TYPE } from '../shared/enums/assets';
import { getAbsolutePath, getAllConfigsOfType } from '../shared/helpers';
import { Config, SoundConfig } from '../shared/interfaces/GeneratorConfigs';
import { getSoundConfigs } from './soundConfigGenerator';
const audiosprite =  require('audiosprite');
import { promisify } from 'util';
import { FILE_TYPES } from '../shared/enums/fileTypes';
const audiospriteAsync = promisify(audiosprite);

export async function packSound(soundConfig: SoundConfig, sourceFolder: string, outputFolder: string) {
    const { srcFolder, optimization, destFolder, name } = soundConfig;
    const files = await getFilesListRecursiveOfTypeAsync(getAbsolutePath([sourceFolder, srcFolder]), [FILE_TYPES.M4A, FILE_TYPES.MP3, FILE_TYPES.OGG, FILE_TYPES.WAV]);
    const options = {
        ...optimization,
        output: getAbsolutePath([outputFolder, destFolder, name])
    };
    const json = await audiospriteAsync(files, options);
    const dest = getAbsolutePath([outputFolder, destFolder, `${name}.json`]);
    await writeFileAsync(dest, JSON.stringify(json));
    console.log(`Sound atlas packed: ${files.length} file(s) -> ${dest}`);
}

export async function packSounds(jsonPath: string) {
    const { general: { sourceFolder, outputFolder }} = await getGameConfigData();
    const fileData = await readFileAsync(jsonPath);
    const config = JSON.parse(fileData.toString()) as Config<SoundConfig>;
    const textureConfigs = await getSoundConfigs(config, jsonPath);
    await Promise.all(textureConfigs.map(async (soundConfig: SoundConfig) => await packSound(soundConfig, sourceFolder, outputFolder)));
}

export async function packAllSounds(dirPath: string) {
    const allSoundConfigs = await getAllConfigsOfType(dirPath, [CFG_TYPE.SOUND]);
    console.log(`Packing sounds... found ${allSoundConfigs.length} sound config(s): ${allSoundConfigs.join(', ')}`);
    await Promise.all(allSoundConfigs.map(async(jsonPath) => await packSounds(jsonPath)));
    console.log('Sounds packed');
}