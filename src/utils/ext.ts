import path from "path"

export const getVideoDir = () => path.join(process.env.WORK_DIR || "", 'temp/videos')
export const getImageDir = () => path.join(process.env.WORK_DIR || "", 'temp/images')

export function pad(number: number, length: number) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}