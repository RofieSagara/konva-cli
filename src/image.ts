import { createCanvas, loadImage } from "canvas";
import Konva from "konva";
import { saveFile } from "./utils/asyncFile";
import logger from "./utils/logger";

export const generatedImage = async (source: string, konva: string, destination: string, width = 720, height = 960) => {
    const start = process.hrtime()
    const canvas = createCanvas(Number(width), Number(height))
    const ctx = canvas.getContext('2d')
    const img = await loadImage(source)
    ctx.drawImage(img, 0, 0, Number(width), Number(height))

    // Generated image
    const konvaConfig = JSON.parse(konva)
    const konvaWidth = konvaConfig.attrs.width
    // const konvaHeight = konvaConfig.attrs.height
    const state: Konva.Stage = Konva.Node.create(konva, createCanvas(Number(width), Number(height)))
    state.width(Number(width))
    state.height(Number(height))

    // get the layer of the konva
    const layer = state.findOne('#main')
    if (layer) {

        // get the main image. this we will override with the original size
        // load image from data and put on group place the group to bottom
        const mainImage = state.findOne<Konva.Image>('#main_image')
        if (mainImage) {
            // load image to Image class
            const dataImage: any = await loadImage(canvas.toDataURL("image/jpeg", 1))
            mainImage.width(Number(width))
            mainImage.height(Number(height))
            mainImage.image(dataImage)
        } else {
            throw Error("#main_image not found make sure the image uploaded")
        }

        // handle the frame of image we put the frame and resize it
        const frame = state.findOne<Konva.Image>('#main_frame')
        if (frame) {
            const dataImage: any = await loadImage(frame.getAttr('src'))
            frame.width(Number(width))
            frame.height(Number(height))
            frame.x(0)
            frame.y(0)
            frame.image(dataImage)
        }

        // handle sticker of the image this the hard part make sure the size and location not mess
        const stickerGroup = state.findOne<Konva.Group>('#stickers')
        if (stickerGroup) {
            for (const transformer of stickerGroup.find('Transformer')) {
                transformer.remove()
            }

            for (const stickerImage of stickerGroup.find<Konva.Image>('Image')) {
                const scale = 720 / konvaWidth
                const dataImage: any = await loadImage(stickerImage.getAttr('src'))
                stickerImage.x(stickerImage.x() * scale)
                stickerImage.y(stickerImage.y() * scale)
                stickerImage.height(stickerImage.height() * scale)
                stickerImage.width(stickerImage.width() * scale)
                stickerImage.image(dataImage)
                stickerImage.draggable(false)
            }
        }

        state.batchDraw()
        //logger.info(state.toJSON())
        const base64Data = state.toDataURL({ mimeType: "image/jpeg", quality: 1 }).replace(/^data:image\/jpeg;base64,/, "")
        await saveFile(destination, base64Data)
        const stop = process.hrtime(start)
        logger.info(`Time convert image to execute: ${(stop[0] * 1e9 + stop[1])/1e9} seconds`)
    } else {
        throw new Error("layer #main not found")
    }
}