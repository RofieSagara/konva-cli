import { createCanvas, loadImage } from "canvas";
import Konva from "konva";
import { saveFile } from "./utils/asyncFile";
import logger from "./utils/logger";

export const generatedImage = async (source: string, konva: string, destination: string, width = 720, height = 960) => {
    const canvas = createCanvas(Number(width), Number(height))
    const ctx = canvas.getContext('2d')
    const img = await loadImage(source)
    ctx.drawImage(img, 0, 0, Number(width), Number(height))

    // Generated image
    const konvaConfig = JSON.parse(konva)
    const konvaWidth = konvaConfig.attrs.width
    // const konvaHeight = konvaConfig.attrs.height
    const state = Konva.Node.create(konva, createCanvas(720, 960))
    state.width(Number(width))
    state.height(Number(height))
    logger.debug('implement config')

    // get the layer of the konva
    const layer = state.findOne('#main')
    if (layer) {

        // get the main image. this we will override with the original size
        // load image from data and put on group place the group to bottom
        const mainImage = state.findOne('#main_image')
        if (mainImage) {
            // load image to Image class
            const dataImage = await loadImage(canvas.toDataURL("image/jpeg", 1))
            mainImage.width(720)
            mainImage.height(960)
            mainImage.image(dataImage)
        } else {
            throw Error("#main_image not found make sure the image uploaded")
        }

        // handle the frame of image we put the frame and resize it
        const frame = state.findOne('#main_frame')
        if (frame) {
            const dataImage = await loadImage(frame.getAttr('src'))
            frame.width(720)
            frame.height(960)
            frame.x(0)
            frame.y(0)
            frame.image(dataImage)
        }

        // handle sticker of the image this the hard part make sure the size and location not mess
        const stickerGroup = state.findOne('#stickers')
        if (stickerGroup) {
            for (const transformer of stickerGroup.find('Transformer')) {
                transformer.remove()
            }

            for (const stickerImage of stickerGroup.find('Image')) {
                const scale = 720 / konvaWidth
                const dataImage = await loadImage(stickerImage.getAttr('src'))
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
    } else {
        throw new Error("layer #main not found")
    }
}