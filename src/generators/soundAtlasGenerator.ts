import { getFilesListRecursiveOfTypeAsync, readFileAsync } from "../shared/io";
import { getGameConfigData } from "../data/gameConfigData";
import { CFG_TYPE } from "../shared/enums/assets";
import { getAbsolutePath, getAllConfigsOfType } from "../shared/helpers";
import { Config, SoundConfig } from "../shared/interfaces/GeneratorConfigs";
import { getSoundConfigs } from "./soundConfigGenerator";
const audiosprite =  require('audiosprite');
import { promisify } from 'util';
import { FILE_TYPES } from "../shared/enums/fileTypes";
const audiospriteAsync = promisify(audiosprite);

export async function packSound(soundConfig: SoundConfig, sourceFolder: string, outputFolder: string) {
    const { srcFolder, optimization, destFolder, name } = soundConfig;
    const files = await getFilesListRecursiveOfTypeAsync(getAbsolutePath([sourceFolder, srcFolder]), [FILE_TYPES.M4A, FILE_TYPES.MP3, FILE_TYPES.OGG, FILE_TYPES.WAV]);
    const options = {
        ...optimization,
        output: getAbsolutePath([outputFolder, destFolder, name])
    };
    await audiospriteAsync(files, options);
}

export async function packSounds(jsonPath: string) {
    const { general: { sourceFolder, outputFolder }} = await getGameConfigData();
    const fileData = await readFileAsync(jsonPath);
    const config = JSON.parse(fileData.toString()) as Config<SoundConfig>;
    const textureConfigs = await getSoundConfigs(config);
    await Promise.all(textureConfigs.map(async (soundConfig: SoundConfig) => await packSound(soundConfig, sourceFolder, outputFolder)));
}

export async function packAllSounds(dirPath: string) {
    const allSoundConfigs = await getAllConfigsOfType(dirPath, [CFG_TYPE.SOUND]);
    await Promise.all(allSoundConfigs.map(async(jsonPath) => await packSounds(jsonPath)));
}