import { getFilesListRecursiveOfTypeAsync, readFileAsync } from '../shared/io';
import { sep } from 'path';
import { FILE_TYPES } from '../shared/enums/fileTypes';
import { exec } from 'child_process';
import { getAbsolutePath } from '../shared/helpers';

export async function packAllTextures(dirPath: string, webp: string) {
    let allTps = await getFilesListRecursiveOfTypeAsync(dirPath, [FILE_TYPES.TPS]);
    let commands = allTps.map(tps => `texturepacker ${tps}`);
    const webpParam = Number(webp)
    
    if(webpParam > 0) {
        const webpCmds = await Promise.all(allTps.map(async (tpsPath: string) => {
            let tps = await (await readFileAsync(tpsPath)).toString();
            let [, path] = /<key>name<\/key>\s*<filename>([.\/{}A-Za-z0-9-_]*)<\/filename>/gm.exec(tps);
            
            let pathParts = path.split(sep).filter(pathPart => pathPart !== '..');
            pathParts.splice(pathParts.length - 1, 0, 'webp');

            const webpPath = getAbsolutePath(['src', ...pathParts]);

            return `texturepacker ${tpsPath} --texture-format webp --webp-quality ${webpParam} --data ${webpPath}`;
        }, []));

        commands = [...commands, ...webpCmds];
    }

    commands.forEach(command => exec(command, (error, stdout, stderr) => {
        if(error || stderr) {
            return console.error(error.message || stderr);
        }

        console.log(stdout);
    }));
}
