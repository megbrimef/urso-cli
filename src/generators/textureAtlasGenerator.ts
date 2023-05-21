import {TextureConfig} from "../shared/interfaces/GeneratorConfigs";
import {Config} from "../shared/interfaces/GeneratorConfigs";
import {
    getFilesListRecursiveOfTypeAsync,
    isFileExistsAsync,
    readFileAsync,
    writeFileAsync,
    mkdirAsync
} from "../shared/io";
import {getTextureConfigs} from "./textureConfigGenerator"
import {packAsync} from "free-tex-packer-core";
import {getAbsolutePath, getAllConfigsOfType, runSafeAsync} from "../shared/helpers";
import {getGameConfigData} from "../data/gameConfigData";
import {FILE_TYPES} from "../shared/enums/fileTypes";
import {resolve} from "path";
import {exec} from "child_process";
import {CFG_TYPE} from "../shared/enums/assets";
import { logInfo, logSuccess, logWarning } from "../shared/logger";

interface TexturePackData {
    path: string;
    contents: Buffer;
}

async function getTexturePackData(srcFolder: string, sourceFolder: string): Promise<TexturePackData[]> {
    const files = await getFilesListRecursiveOfTypeAsync(getAbsolutePath([sourceFolder, srcFolder]), [FILE_TYPES.PNG, FILE_TYPES.JPG]);

    return await Promise.all(files.map(async (file) => {
        file = file.replaceAll(/\\/g, '/');
        const [ , path ] = file.split(srcFolder);
        const contents = await readFileAsync(file);
        return {
            path: path.slice(1),
            contents
        }
    }));
}

async function packAtlas(textureConfig: TextureConfig, sourceFolder: string, outputFolder: string) {
    await runSafeAsync(async () => {
        const {srcFolder, destFolder, packer, needOptimize} = textureConfig;
        const files = await getTexturePackData(srcFolder, sourceFolder);
        const result = await packAsync(files, packer);

        await Promise.all(result.map(async ({name, buffer}) => {
            const toDest = getAbsolutePath([outputFolder, destFolder]);
            
            if (!await isFileExistsAsync(toDest)) {
                await mkdirAsync(toDest, {recursive: true});
            }

            await writeFileAsync(resolve(toDest, name), buffer);

            if(name.endsWith('.png') && needOptimize) {
                optimize(resolve(toDest, name));
            }
        }));
    });
}

function optimize(fPath: string) {
    const cmd = `pngquant --force --ext .png ${fPath}`;
    exec(cmd, (err) => {
        if (err)
            logWarning(`Optimization FAILED. Need adjust min quality for optimize ${fPath}.`);
    })
}

export async function packAtlases(textureConfigAbsolutePath: string) {
    const {general: {sourceFolder, outputFolder}} = await getGameConfigData();
    const fileData = await readFileAsync(textureConfigAbsolutePath);
    const config = JSON.parse(fileData.toString()) as Config<TextureConfig>;
    logInfo(`Texture pack starting ${config.shared.packer.textureName}`);
    const textureConfigs = await getTextureConfigs(config);
    await Promise.all(textureConfigs.map(async (textureConfig: TextureConfig) =>
        await packAtlas(textureConfig, sourceFolder, outputFolder)));
    logSuccess(`Packing ${config.shared.packer.textureName} DONE`);
}

export async function packAllTextures(dirPath: string) {
    const allTextureConfigs = await getAllConfigsOfType(dirPath, [CFG_TYPE.TEXTURE]);
    await Promise.all(allTextureConfigs.map(async (jsonPath) => await packAtlases(jsonPath)));
    logSuccess(`Texture pack DONE`);
}
