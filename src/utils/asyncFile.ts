import pkg from 'fs-extra';
const { mkdir, readdir, writeFile } = pkg;

export const saveFile = (dest: string, base64Data: Blob) => {
    return new Promise((resolve, reject) => {
        writeFile(dest, base64Data, 'base64', (err) => (err) ? reject(err) : resolve(true))
    });
}

export const readFiles = (dirname: string) => {
    return new Promise((resolve, reject) => {
      readdir(dirname, (err, filenames) => (err) ? reject(err) : resolve(filenames))
    });
}

export function createDirectory(name: string){
    return new Promise((resolve, reject) => {
        mkdir(name, { recursive: true }, (err) => {
            if (err) reject(err)
            else resolve(true)
        })
    })
}