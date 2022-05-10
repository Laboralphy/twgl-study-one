import Manager from './libs/gl-sprite-manager/manager.js'
import SpriteLayer from "./libs/gl-sprite-manager/sprite-layer";

const oManager = new Manager()

async function init () {
    await oManager.init({ canvas: document.querySelector('canvas#screen') })
    const oStarTI = await oManager.loadImageAndCreateTextureInfo('assets/textures/sprites/star.jpg')
    await oManager.loadImageAndCreateTextureInfo('assets/textures/sprites/leaves.jpg')
    await oManager.loadImageAndCreateTextureInfo('assets/textures/sprites/keyboard.jpg')
    const oTombTI = await oManager.loadImageAndCreateTextureInfo('assets/textures/sprites/TMS1A0.png')
    const oSprite1 = oManager.createSprite(oTombTI)
    oSprite1.x = 200
    oSprite1.y = 300
    oSprite1.xScale = 2
    oSprite1.yScale = 2
    oSprite1.defineRef(0.5, 1)
    const oLayer = new SpriteLayer()
    oLayer.viewport.x = 0
    oLayer.viewport.width = 1000
    oLayer.viewport.height = 1000
    oManager.linkLayer(oLayer)
    oLayer.linkSprite(oSprite1)
}

async function main () {
    await init()
    oManager.render()
}

window.addEventListener('load', main)