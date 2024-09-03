import { getFilesListRecursiveOfTypeAsync, isFileExistsAsync, mkdirAsync, readFileAsync, writeFileAsync } from '../shared/io';
import { getAbsolutePath } from '../shared/helpers';
import { GameGeneralConfig, GameLayoutConfig } from '../shared/interfaces/GameConfig';
import { FILE_TYPES } from '../shared/enums/fileTypes';

export async function packAllLayouts(layoutCfg: GameLayoutConfig, generalCfg: GameGeneralConfig) {
    const sourcePath = getAbsolutePath([generalCfg.sourceFolder, layoutCfg.source]);
    const outputPath = getAbsolutePath([generalCfg.outputFolder, layoutCfg.output]);
    const imagesSource = getAbsolutePath([generalCfg.sourceFolder, layoutCfg.imagesSource]);

    const htmlFiles = await getFilesListRecursiveOfTypeAsync(sourcePath, [FILE_TYPES.HTML]);
    const allImages = await getFilesListRecursiveOfTypeAsync(imagesSource, [FILE_TYPES.PNG, FILE_TYPES.JPG, FILE_TYPES.JPEG]);
    
    const imagesMap = (await Promise.all(allImages.map(async imgPath => {
        const [name, ext] = imgPath.replace(imagesSource, '').split('.');
        const base64 = await readFileAsync(imgPath, { encoding: 'base64' });
        return {
            [name.slice(1)]: `data:image/${ext};base64,${base64}`
        }
    }))).reduce((acc, cur) => ({ ...acc, ...cur }), {});

    await Promise.all(htmlFiles.map(async htmlPath => {
        const html = await readFileAsync(htmlPath, { encoding: 'utf8' });
        const regex = /{image_assetKey=([A-Za-z0-9_\/]*)}/gm;   

        const newHtml = html.replace(regex, (match, assetKey) => {
            return imagesMap[assetKey] || match;
        });
        
        const outputHtmlPath = htmlPath.replace(sourcePath, outputPath);

        if(!(await isFileExistsAsync(outputPath))) {
            await mkdirAsync(outputPath, { recursive: true });
        }
        await writeFileAsync(outputHtmlPath, newHtml);
    }));
}