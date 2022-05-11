/**
 * Asynchronously loads an image and return the HTMLImageElement object
 * @param src {string} image location
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage (src) {
    return new Promise((resolve, reject) => {
        /**
         * @type {HTMLImageElement}
         */
        const oImage = new Image();
        oImage.addEventListener('load', () => {
            resolve(oImage)
        })
        oImage.addEventListener('error', () => {
            reject(new Error('ERR_IMAGE_NOT_FOUND ' + src))
        })
        oImage.src = src
    })
}
