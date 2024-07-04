import { Argument, Command } from 'commander';
import { packAllSounds } from '../../generators/soundAtlasGenerator';
import { getGameConfigData } from '../../data/gameConfigData';
import { packAllTextures } from '../../generators/textureAtlasGenerator';
import { CFG_TYPE } from '../../shared/enums/assets';
import { getAbsolutePath } from '../../shared/helpers';
import { copyAll } from '../../shared/io';
import { packUber } from '../../generators/uberGenerator';

const typeArg = new Argument('[type]', 'type of argument')
    .choices([CFG_TYPE.TEXTURE, CFG_TYPE.SOUND, CFG_TYPE.COPY, CFG_TYPE.UBER]);

async function action(type = CFG_TYPE.ALL) {
    const { general: { sourceFolder, outputFolder }, copy, uber } = await getGameConfigData();
    const fromFolder = getAbsolutePath([sourceFolder]);

    switch (type) {
        case CFG_TYPE.TEXTURE:
            await packAllTextures(fromFolder);
            break;
        case CFG_TYPE.SOUND:
            await packAllSounds(fromFolder);
            break;
        case CFG_TYPE.COPY:
            await copyAll(sourceFolder, outputFolder, copy);
            break;
        case CFG_TYPE.UBER:
            await packUber(sourceFolder, outputFolder, uber);
            break;
        default:
            await packAllTextures(fromFolder);
            await packAllSounds(fromFolder);
            await packUber(sourceFolder, outputFolder, uber);
            await copyAll(sourceFolder, outputFolder, copy);
            break;
    }
}

export function addPackSubcommand(program: Command) {
    return program
        .command('pack')
        .description('create assets from configs')
        .addArgument(typeArg)
        .action(action)
};