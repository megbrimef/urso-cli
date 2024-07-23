import { Argument, Command } from 'commander';
import { packAllSounds } from '../../generators/soundAtlasGenerator';
import { getGameConfigData } from '../../data/gameConfigData';
import { packAllTextures } from '../../generators/textureAtlasGenerator';
import { CFG_TYPE } from '../../shared/enums/assets';
import { getAbsolutePath } from '../../shared/helpers';
import { copyAll } from '../../shared/io';
import { packUber } from '../../generators/uberGenerator';

const typeArg = new Argument('[type]', 'type of argument')
    .choices([CFG_TYPE.TPS, CFG_TYPE.SOUND, CFG_TYPE.COPY, CFG_TYPE.UBER])

async function action(type = CFG_TYPE.ALL, params) {
    const { webp } = params;
    const { general: { sourceFolder, outputFolder }, copy, uber } = await getGameConfigData();
    const fromFolder = getAbsolutePath([sourceFolder]);

    switch (type) {
        case CFG_TYPE.TPS:
            await packAllTextures(fromFolder, webp);
            break;
        case CFG_TYPE.SOUND:
            await packAllSounds(fromFolder);
            break;
        case CFG_TYPE.COPY:
            await copyAll(sourceFolder, outputFolder, copy);
            break;
        case CFG_TYPE.UBER:
            await packUber(outputFolder, uber);
            break;
        default:
            await packAllTextures(fromFolder, webp);
            await packAllSounds(fromFolder);
            await copyAll(sourceFolder, outputFolder, copy);
            await packUber(outputFolder, uber);
            break;
    }
}

export function addPackSubcommand(program: Command) {
    return program
        .command('pack')
        .description('create assets from configs')
        .addArgument(typeArg)
        .option('-w, --webp <quality>', 'generate webp atlasses 30-100', '0')
        .action(action);
};