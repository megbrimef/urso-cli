import { getFilesListRecursiveOfTypeAsync, isFileExistsAsync, mkdirAsync, readFileAsync, rmAsync, writeFileAsync } from '../shared/io';
import { getAbsolutePath } from '../shared/helpers';
import { GameExtraConfig, GameGeneralConfig } from '../shared/interfaces/GameConfig';
import { dirname, join } from 'path';


export async function packExtra(extraCfg: GameExtraConfig, generalCfg: GameGeneralConfig) {
    console.log('Packing extra assets...');
    const data = await Promise.all(extraCfg.list.map(async cfg => {
        const generatedConfig = await Promise.all(cfg.generate.map(async gen => {
            const outputPath = getAbsolutePath([generalCfg.outputFolder, gen.source]);
            const files = await getFilesListRecursiveOfTypeAsync(outputPath, gen.extensions);

            const imagesCfg = await Promise.all(files.map(async file => {
                const data = await readFileAsync(file, { encoding: 'base64' });
                return { [(file.split(gen.source).pop()).split('.')[0].slice(1)]: `data:image/${file.split('.').pop()};base64,${data}` };
            }));

            const relativePath = join(generalCfg.outputFolder, gen.output);
            
            const absolutePath = getAbsolutePath([relativePath]);
            console.log(absolutePath);
            
            if(await isFileExistsAsync(absolutePath)) {
                await rmAsync(absolutePath);
            }

            if(!(await isFileExistsAsync(dirname(absolutePath)))) {
                await mkdirAsync(dirname(absolutePath), { recursive: true });
            }

            await writeFileAsync(absolutePath, JSON.stringify(imagesCfg, null, 4));
            return { 
                name: cfg.name, 
                lazy: cfg.lazy,
                asset: relativePath.replace(generalCfg.outputFolder, '').slice(1)
            };
        }));

        return generatedConfig;
    }));

    const absolutePath = getAbsolutePath([generalCfg.outputFolder, extraCfg.output]);

    if(await isFileExistsAsync(absolutePath)) {
        await rmAsync(absolutePath);
    }

    if(!(await isFileExistsAsync(dirname(absolutePath)))) {
        await mkdirAsync(dirname(absolutePath), { recursive: true });
    }

    await writeFileAsync(absolutePath, JSON.stringify(data, null, 4));
    console.log('Extra assets packed!');
}