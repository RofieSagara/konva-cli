import { Command } from 'commander'
import { generatedImage } from './src/image';
import logger from './src/utils/logger';
const program = new Command()

program.name("konva-cli")
    .description("CLI for build konva with the cli")
    .version("0.0.1")

program.command('split')
    .description('Split a string into substrings and display as an array')
    .argument('<string>', 'string to split')
    .option('--first', 'display just the first substring')
    .option('-s, --separator <char>', 'separator character', ',')
    .action((str, options) => {
        const limit = options.first ? 1 : undefined
        console.log(str.split(options.separator, limit))
        program.error("this just sample error", { exitCode: 2, code: 'generated.image.failed' })
    });

program.command('image')
    .description('Build image with canvas with the source and destination with konva config json')
    .argument('<source>', 'path the source')
    .argument('<destination>', 'destination path to save the result')
    .argument('[konva]', 'konva config to put')
    .option('-w, --width <number>', 'override the width of the size default its 720')
    .option('-h --height <number>', 'override the height of the size default its 960')
    .action(async(source, destination, konva, options) => {
        //logger.debug({ source, destination, konva, options })
        try {
            await generatedImage(source, konva, destination, options.width, options.height)
        } catch (ex: any) {
            program.error(ex, { exitCode: 2, code: 'generated.image.failed' })
        }
    })

program.parse()