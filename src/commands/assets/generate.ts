import { Argument, Command } from 'commander';
import { CFG_TYPE } from '../../shared/enums/assets';
import { getAbsolutePath } from '../../shared/helpers';
import { generateWebP } from '../../generators/webpGenerator';

const typeArg = new Argument('[type]', 'type of argument')
    .argRequired()
    .choices([CFG_TYPE.WEBP]);

const pathArg = new Argument('[path]', 'path of config')
    .argRequired();

async function action(type: CFG_TYPE, path: string) {
    switch (type) {
        case CFG_TYPE.WEBP:
            path = getAbsolutePath([path]);
        await generateWebP({ path });
           break;
        default:
            break;
    }
}

export function addGenerateSubcommand(program: Command) {
    return program
        .command('generate')
        .description('basic assets generator')
        .addArgument(typeArg)
        .addArgument(pathArg)
        .action(action)
};