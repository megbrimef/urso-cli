import { resolve, extname, basename } from 'path';
import { CFG_TYPE } from './enums/assets';
import { FILE_TYPES } from './enums/fileTypes';
import { Config } from './interfaces/GeneratorConfigs';
import { getFilesListRecursiveOfTypeAsync, readFileAsync } from './io';
import { Command } from 'commander';

export function getAbsolutePath(parts: string[]): string {
    return resolve(process.cwd(), ...parts);
}

export function getFileExtension(filePath: string): string {
    return extname(filePath).slice(1);
}

export function runSafe<T> (clbk: Function): T {
    try {
        return clbk();
    } catch (e) {
        throw new Error(e.message);
    }
}

export async function runSafeAsync<T> (clbk: Function, throwError: boolean = false): Promise<T> {
    try {
        return await clbk();
    } catch (e) {
        if(throwError)
            throw new Error(e.message || e.description);
    }
}

export function getFileName(assetPath: string): string {
    return basename(assetPath).split('.').shift();
}

export async function getAllConfigsOfType(dirPath: string, types: Array<CFG_TYPE>): Promise<string[]> {
    const jsonPaths = await getFilesListRecursiveOfTypeAsync(dirPath, [FILE_TYPES.JSON]);

    return (await Promise.all(jsonPaths.map(async (jsonPath) => {
        const json = JSON.parse((await readFileAsync(jsonPath)).toString()) as Config<{}>;
        return json.meta === 'URC' && types.includes(json.type) ? jsonPath : null;
    }))).filter(jsonPath => jsonPath);
}

export function stringify(obj: unknown): string {
    return JSON.stringify(obj, null, 4)
}