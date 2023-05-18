#!/usr/bin/env node

import { createCommand, Argument } from 'commander';
import { packAllSounds } from '../../generators/soundAtlasGenerator';
import { getGameConfigData } from '../../data/gameConfigData';
import { packAllTextures } from '../../generators/textureAtlasGenerator';
import { CFG_TYPE } from '../../shared/enums/assets';
import { getAbsolutePath } from '../../shared/helpers';
import { copyAll } from '../../shared/io';

const typeArg = new Argument('[type]', 'type of argument')
    .choices([CFG_TYPE.TEXTURE, CFG_TYPE.SOUND, CFG_TYPE.COPY]);

const cmd = createCommand()
    .addArgument(typeArg)
    .parse();

const [type = CFG_TYPE.ALL] = cmd.args;

(async () => {
    const { general: { sourceFolder, outputFolder }, copy} = await getGameConfigData();
    const fromFolder = getAbsolutePath([sourceFolder]);

    switch (type) {
        case CFG_TYPE.TEXTURE:
            await packAllTextures(fromFolder);
            break;
        case CFG_TYPE.SOUND:
            await packAllSounds(fromFolder);
        case CFG_TYPE.COPY:
                await copyAll(sourceFolder, outputFolder, copy);
        default:
            await packAllTextures(fromFolder);
            await packAllSounds(fromFolder);
            await copyAll(sourceFolder, outputFolder, copy);
            break;
    }
})();
