import { exec } from 'child_process';
import { readdir, writeFile, stat, readFile, mkdir } from 'fs';
import { resolve, parse } from 'path';
import { promisify } from 'util';
import { FILE_TYPES } from './enums/fileTypes';
import { getAbsolutePath, runSafeAsync } from './helpers';
const copy = require('recursive-copy');

const mkdirAsync = promisify(mkdir)
const readDirAsync = promisify(readdir);
const writeFileAsync = promisify(writeFile);
const statAsync = promisify(stat);
const readFileAsync = promisify(readFile);
const copyAsync = promisify(copy);


async function isFileExistsAsync(filePath: string): Promise<boolean> {
    return await runSafeAsync<boolean>(async () => !!await statAsync(filePath));
}

async function isDirectory(filePath: string): Promise<boolean> {
    const stat = await statAsync(filePath);
    return stat.isDirectory();
}

export async function getFilesListRecursiveAsync(fromPath: string): Promise<string[]> {
    const files: string[] = [];
    const isDir = await isDirectory(fromPath);
    const newFiles = isDir ? await getFilesFromDirAsync(fromPath) : [fromPath];
    return [...files, ...newFiles];
}

export async function getFilesListRecursiveOfTypeAsync(fromPath: string, fileTypes: Array<FILE_TYPES>): Promise<string[]> {

    if(!await isFileExistsAsync(fromPath)) {
        return [];
    }
    
    const allFiles = await getFilesListRecursiveAsync(fromPath);
    return allFiles.filter(file => fileTypes.some(fileType => file.endsWith(fileType)));
}

async function getFilesFromDirAsync(dirPath: string): Promise<string[]> {
    const filesInDir = await readDirAsync(dirPath);

    const allFilesInDir = await Promise
        .all(filesInDir
            .map(async (fileName) =>
                await getFilesListRecursiveAsync(resolve(dirPath, fileName))));

    return allFilesInDir.reduce((acc, cur) => [...acc, ...cur], []);
}

async function writeFileRecursiveAsync(fPath: string, data: string | NodeJS.ArrayBufferView) {
    const { dir } = parse(fPath);
    
    if(!await isFileExistsAsync(dir)) {
        await mkdirAsync(dir, { recursive: true });
    }

    await writeFileAsync(fPath, data);
}

async function copyAll(sourceFolder: string, outputFolder: string, copyData: { [from: string]: string } ) {
    for (const [from, to] of Object.entries(copyData)) {
        const fromPath = getAbsolutePath([sourceFolder, from]);
        const toPath = getAbsolutePath([outputFolder, to]);
        await copyAsync(fromPath, toPath, { overwrite: true });
    }
}

export {
    statAsync,
    readDirAsync,
    isFileExistsAsync,
    writeFileAsync,
    readFileAsync,
    isDirectory,
    mkdirAsync,
    writeFileRecursiveAsync,
    copyAll,
    copyAsync
}
