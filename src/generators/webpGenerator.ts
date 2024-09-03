import { getFilesListRecursiveOfTypeAsync } from '../shared/io';
import { FILE_TYPES } from '../shared/enums/fileTypes';
import { exec } from 'child_process';

export async function generateWebP({ path }: { path: string }) {
    const files = await getFilesListRecursiveOfTypeAsync(path, [FILE_TYPES.PNG]);

    const commands = files.map(file => `cwebp ${file} -o ${file.replace(FILE_TYPES.PNG, FILE_TYPES.WEBP)}`);

    commands.forEach(command => exec(command, (error, stdout, stderr) => {
        if(error || stderr) {
            return console.error(error?.message || stderr);
        }

        console.log(stdout);
    }));
}