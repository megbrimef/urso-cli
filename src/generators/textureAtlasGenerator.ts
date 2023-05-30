import {TextureConfig, WebpConfig} from "../shared/interfaces/GeneratorConfigs";
import {Config} from "../shared/interfaces/GeneratorConfigs";
import {
    getFilesListRecursiveOfTypeAsync,
    isFileExistsAsync,
    readFileAsync,
    writeFileAsync,
    mkdirAsync,
    execAsync
} from "../shared/io";
import {getTextureConfigs} from "./textureConfigGenerator"
import {packAsync} from "free-tex-packer-core";
import {getAbsolutePath, getAllConfigsOfType, runSafeAsync} from "../shared/helpers";
import {getGameConfigData} from "../data/gameConfigData";
import {FILE_TYPES} from "../shared/enums/fileTypes";
import {resolve} from "path";
import {CFG_TYPE} from "../shared/enums/assets";
import { logInfo, logSuccess } from "../shared/logger";

interface TexturePackData {
    path: string;
    contents: Buffer;
}

async function getTexturePackData(srcFolder: string, sourceFolder: string): Promise<TexturePackData[]> {
    const files = await getFilesListRecursiveOfTypeAsync(getAbsolutePath([sourceFolder, srcFolder]), [FILE_TYPES.PNG, FILE_TYPES.JPG]);

    return await Promise.all(files.map(async (file) => {
        file = file.replace(/\\/g, '/');
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
        const {srcFolder, destFolder, packer, optimize, webp} = textureConfig;
        const files = await getTexturePackData(srcFolder, sourceFolder);
        const result = await packAsync(files, packer);

        await Promise.all(result.map(async ({name, buffer}) => {
            const toDest = getAbsolutePath([outputFolder, destFolder]);
            const absoluteDestPath = resolve(toDest, name);

            if (!await isFileExistsAsync(toDest)) {
                await mkdirAsync(toDest, {recursive: true});
            }

            await writeFileAsync(absoluteDestPath, buffer);

            if(name.endsWith('.png') && optimize?.enabled) {
                await makeOptimize(absoluteDestPath);
            }

            if((name.endsWith('.png') || name.endsWith('.jpg')) && webp?.enabled) {
                const webpDestFolderPath = resolve(toDest, webp?.webpPath || '.');

                if (!await isFileExistsAsync(webpDestFolderPath)) {
                    await mkdirAsync(webpDestFolderPath, {recursive: true});
                }

                await makeWebp(toDest, webp?.webpPath || '.', name, webp);
            }
        }));
    });
}

async function makeOptimize(fPath: string) {
    const cmd = `pngquant --force --ext .png ${fPath}`;
    await execAsync(cmd);
}

async function makeWebp(toDest: string, webpPath: string, fileName: string, webp: WebpConfig) {
    const nameParts = fileName.split('.');
    nameParts.splice(-1);
    const nameWithoutExt = nameParts.join('.');
    const jsonAtlas = (await readFileAsync(resolve(toDest, `${nameWithoutExt}.json`))).toString();
    const json = JSON.parse(jsonAtlas);
    json.meta.image = `${nameWithoutExt}.webp`;
    const quality = webp.quality;

    await writeFileAsync(resolve(toDest, webpPath, `${nameWithoutExt}.json`), JSON.stringify(json, null, 2));
    const cmd = `cwebp ${resolve(toDest, fileName)} ${webp.lossless ? '-lossless' : '' } -q ${quality} -o ${resolve(toDest, webpPath, `${nameWithoutExt}.webp`)}`;
    await execAsync(cmd);
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
