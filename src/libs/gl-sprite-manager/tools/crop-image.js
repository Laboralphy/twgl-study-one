/**
 * Crops an image and produce a new canvas filled with the cropped region
 * @param oImage {HTMLCanvasElement|HTMLImageElement}
 * @param x {number} starting column of cropped region
 * @param y {number} starting row of cropped region
 * @param width {number} of cropped region in pixel
 * @param height {number} of cropped region in pixel
 * @returns {HTMLCanvasElement} Canvas produced with the cropped region
 */
export function cropImage (oImage, x, y, width, height) {
    x = x || 0
    y = y || 0
    width = width || oImage.width
    height = height || oImage.height
    const oCanvas = document.createElement('canvas')
    oCanvas.width = width
    oCanvas.height = height
    const ctx = oCanvas.getContext('2d')
    ctx.drawImage(oImage, x, y, width, height, 0, 0, width, height)
    return oCanvas
}
