#!/usr/bin/env node
import {createCommand, Argument} from 'commander';
import {writeFileRecursiveAsync} from '../../shared/io';
import {CFG_TYPE} from '../../shared/enums/assets';
import {getTextureTemplate} from '../../generators/textureConfigGenerator';
import {getSoundTemplate} from '../../generators/soundConfigGenerator';
import {getAbsolutePath} from '../../shared/helpers';
import { logSuccess } from '../../shared/logger';

const typeArg = new Argument('[type]', 'type of argument')
    .argRequired()
    .choices([CFG_TYPE.TEXTURE, CFG_TYPE.SOUND]);

const nameArg = new Argument('[name]', 'name of config')
    .argRequired();

const pathArg = new Argument('[path]', 'path of config')
    .argRequired();

const cmd = createCommand()
    .addArgument(typeArg)
    .addArgument(nameArg)
    .addArgument(pathArg)
    .parse();

const [type, name, path] = cmd.args;

let template: string = '';

switch (type) {
    case CFG_TYPE.TEXTURE:
        template = getTextureTemplate(name);
        break;
    case CFG_TYPE.SOUND:
        template = getSoundTemplate(name);
    default:
        break;
}

writeFileRecursiveAsync(getAbsolutePath([path, `${name}.json`]), template);
logSuccess(`Config file '${name}' was created`);


