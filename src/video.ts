import { createCanvas, loadImage } from "canvas"
import Konva from "konva"
import { join } from "path"
import { createDirectory, readFiles, saveFile } from "./utils/asyncFile"
import { pad } from "./utils/ext"
import logger from "./utils/logger"


export const generatedVideo = async (sourceFolder: string, konva: string, destinationFolder: string, destinationShared: string, width = 720, height = 960) => {
    const start = process.hrtime()
    const imageCollection: string[] = await readFiles(sourceFolder)
    const resultImage: string[] = []
    for (const iterator of imageCollection) {
        const canvas = createCanvas(Number(720), Number(960))
        const ctx = canvas.getContext("2d")
        const img = await loadImage(join(sourceFolder, iterator))
        ctx.drawImage(img, 0, 0, Number(720), Number(960))
        const dataURL = canvas.toDataURL("image/jpeg", 1)
        resultImage.push(dataURL)
    }

    // Generated video
    const konvaConfig = JSON.parse(konva)
    const konvaWidth = konvaConfig.attrs.width
    // const konvaHeight = konvaConfig.attrs.height
    const state: Konva.Stage = Konva.Node.create(konva, createCanvas(Number(width), Number(height)))
    state.width(Number(width))
    state.height(Number(height))

    // get the layer of the konva
    const layer = state.findOne<Konva.Layer>('#main')
    if (layer) {

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
            for (const transformer of stickerGroup.find<Konva.Transformer>('Transformer')) {
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

        // get the main image. this we will override with the original size
        // load image from data and put on group place the group to bottom
        const mainImage = new Konva.Image({ width: 720, height: 960, x: 0, y: 0, image: undefined })
        layer.add(mainImage)
        mainImage.moveToBottom()
        if (mainImage) {
            // load image to Image class
            const dataUrl = []
            for (const imageSeq of resultImage) {
                const dataImage: any = await loadImage(imageSeq)
                mainImage.width(Number(width))
                mainImage.height(Number(height))
                mainImage.image(dataImage)
                layer.batchDraw()
                dataUrl.push(state.toDataURL({ mimeType: "image/jpeg", quality: 1 }))
            }

            // save each image to disk
            await createDirectory(destinationFolder)
            let index = 0
            const randomThumbnail = dataUrl[Math.floor(Math.random() * dataUrl.length)]
            for (const iterator of dataUrl) {
                const base64Data = iterator.replace(/^data:image\/jpeg;base64,/, "")
                await saveFile(join(destinationFolder,`${pad(index, 3)}_result.jpeg`), base64Data)
                if (iterator == randomThumbnail) {
                    await saveFile(destinationShared, base64Data)
                }
                index++
            }

            const stop = process.hrtime(start)
            logger.info(`Time convert video to execute: ${(stop[0] * 1e9 + stop[1])/1e9} seconds`)
        } else {
            throw new Error("can't create main image")
        }
    } else {
        throw new Error("layer #main not found")
    }
}