import { FILE_TYPES } from '../shared/enums/fileTypes';
import { getAbsolutePath, getFileName } from '../shared/helpers';
import { GameUberConfig } from '../shared/interfaces/GameConfig';
import { getFilesListRecursiveOfTypeAsync, readFileAsync, writeFileAsync } from '../shared/io';

export async function packUber(
    sourceFolder: string,
    outputFolder: string,
    uber: GameUberConfig
) {
    if(!uber) {
        console.error('Uber section not found in config! Uber json pack failed!');
        return;
    }

    const { folders, output } = uber;

    const list = (await Promise.all(folders
        .map(folder => getAbsolutePath([sourceFolder, folder]))
        .map(async path => await getFilesListRecursiveOfTypeAsync(path, [FILE_TYPES.JSON]))))
        .reduce((acc, arr) => ([ ...acc, ...arr ]), []);
        
    const json = (await Promise.all(list
        .map(async path => ({
            name: getFileName(path), 
            file: (await readFileAsync(path)).toString() 
        }))))
        .reduce((acc, { name, file }) => ({ ...acc, [name]: JSON.parse(file) }), {});

    const outputJson = getAbsolutePath([ outputFolder, output ]);
    await writeFileAsync(outputJson, JSON.stringify(json));
    console.log('Uber packed');
}