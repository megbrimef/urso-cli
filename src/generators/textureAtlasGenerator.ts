import { TextureConfig, TextureOptConfig } from "../shared/interfaces/GeneratorConfigs";
import { Config } from "../shared/interfaces/GeneratorConfigs";
import { getFilesListRecursiveOfTypeAsync, isFileExistsAsync, readFileAsync, writeFileAsync, mkdirAsync } from "../shared/io";
import { getTextureConfigs } from "./textureConfigGenerator"
import { packAsync } from "free-tex-packer-core";
import { getAbsolutePath, getAllConfigsOfType, runSafeAsync } from "../shared/helpers";
import { getGameConfigData } from "../data/gameConfigData";
import { FILE_TYPES } from "../shared/enums/fileTypes";
import { resolve } from "path";
import { exec } from "child_process";
import { CFG_TYPE } from "../shared/enums/assets";

interface TexturePackData {
    path: string;
    contents: Buffer;
}

async function getTexturePackData(srcFolder: string, sourceFolder: string): Promise<TexturePackData[]> {
    const files = await getFilesListRecursiveOfTypeAsync(getAbsolutePath([sourceFolder, srcFolder]), [FILE_TYPES.PNG]);

    return await Promise.all(files.map(async (file) => {
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
        const { srcFolder, destFolder, packer, optimization } = textureConfig;
        const files = await getTexturePackData(srcFolder, sourceFolder);
        const [json, atlas] = await packAsync(files, packer);
        const toDest = getAbsolutePath([outputFolder, destFolder]);
        
        if(!await isFileExistsAsync(toDest)) {
            await mkdirAsync(toDest,{ recursive: true });   
        }

        await writeFileAsync(resolve(toDest, json.name), json.buffer);
        await writeFileAsync(resolve(toDest, atlas.name), atlas.buffer);

        optimize(resolve(toDest, atlas.name), optimization);
    }, true);
}

function optimize(fPath:string, optimization: TextureOptConfig) {
    const { min, max, speed } = optimization;
    const cmd = `pngquant --force --ext .png --quality ${min}-${max} --speed ${speed} ${fPath}`;
    exec(cmd, (err) => {
        if(err)
            console.error('Need adjust min quality for optimize');
    })
}

export async function packAtlases(textureConfigAbsolutePath: string) {
    const { general: { sourceFolder, outputFolder }} = await getGameConfigData();
    const fileData = await readFileAsync(textureConfigAbsolutePath);
    const config = JSON.parse(fileData.toString()) as Config<TextureConfig>;
    const textureConfigs = await getTextureConfigs(config);
    await Promise.all(textureConfigs.map(async (textureConfig: TextureConfig) => 
        await packAtlas(textureConfig, sourceFolder, outputFolder)));
}

export async function packAllTextures(dirPath: string) {
    const allTextureConfigs = await getAllConfigsOfType(dirPath, [CFG_TYPE.TEXTURE]);
    await Promise.all(allTextureConfigs.map(async(jsonPath) => await packAtlases(jsonPath)));
}
