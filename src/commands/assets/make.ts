import { Argument, Command } from 'commander';
import { writeFileRecursiveAsync } from '../../shared/io';
import { CFG_TYPE } from '../../shared/enums/assets';
import { getTextureTemplate } from '../../generators/textureConfigGenerator';
import { getSoundTemplate } from '../../generators/soundConfigGenerator';
import { getAbsolutePath } from '../../shared/helpers';

const typeArg = new Argument('[type]', 'type of argument')
    .argRequired()
    .choices([CFG_TYPE.TEXTURE, CFG_TYPE.SOUND]);

const nameArg = new Argument('[name]', 'name of config')
    .argRequired();

const pathArg = new Argument('[path]', 'path of config')
    .argRequired();

function action(type: string, name: string, path: string) {
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
}

export function addMakeSubcommand(program: Command) {
    return program
        .command('make')
        .description('create config')
        .addArgument(typeArg)
        .addArgument(nameArg)
        .addArgument(pathArg)
        .action(action)
};