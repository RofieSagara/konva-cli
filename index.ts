import { Command } from 'commander'
import { generatedImage } from './src/image';
import logger from './src/utils/logger';
import { generatedVideo } from "./src/video";
const program = new Command()

program.name("konva-cli")
    .description("CLI for build konva with the cli")
    .version("0.0.1")

program.command('image')
    .description('Build image with canvas with the source and destination with konva config json')
    .argument('<source>', 'path the source')
    .argument('<destination>', 'destination path to save the result')
    .argument('[konva]', 'konva config to put')
    .option('-w, --width <number>', 'override the width of the size default its 720')
    .option('-h --height <number>', 'override the height of the size default its 960')
    .action(async (source, destination, konva, options) => {
        try {
            await generatedImage(source, konva, destination, options.width, options.height)
        } catch (ex: any) {
            program.error(ex, { exitCode: 2, code: 'generated.image.failed' })
        }
    })

program.command('video')
    .description('Build video with canvas with the source folder and destination folder with shared image with konva config json')
    .argument('<source>', 'path the source folder')
    .argument('<destination>', 'destination folder to save the result collection')
    .argument('<sharedPath>', 'path will use for save shared file/thumbnail file')
    .argument('[konva]', 'konva config to put')
    .option('-w, --width <number>', 'override the width of the size default its 720')
    .option('-h --height <number>', 'override the height of the size default its 960')
    .action(async (source, destination, sharedPath, konva, options) => {
        try {
            await generatedVideo(source, konva, destination, sharedPath, options.width, options.height)
        } catch (ex: any) {
            program.error(ex, { exitCode: 2, code: 'generated.video.failed' })
        }
    })

program.parse()