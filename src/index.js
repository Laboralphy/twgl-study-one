import Manager from './libs/gl-sprite-manager/Manager.js'
import SpriteLayer from "./libs/gl-sprite-manager/SpriteLayer";

const oManager = new Manager()

const aObjects = {}

async function init () {
    await oManager.init({ canvas: document.querySelector('canvas#screen') })
    const oTombTI = await oManager.loadImage('assets/textures/sprites/TMS1A0.png')
    const oImg2 = await oManager.loadImage('assets/textures/sprites/TMS5A0.png')
    const oImg3 = await oManager.loadImage('assets/textures/sprites/FLARA1.png')

    const oSprite1 = oManager.createSprite(oTombTI, 41, 53, [{ x: 0, y: 0 }])
    oSprite1.x = 400
    oSprite1.y = 400
    oSprite1.xScale = 4
    oSprite1.yScale = 4
    oSprite1.defineRef(0.5, 1)
    oSprite1.options.rotation = 1
    const oLayer = new SpriteLayer()
    oLayer.view.position.x = 0
    oLayer.view.width = 1000
    oLayer.view.height = 1000
    oManager.linkLayer(oLayer)
    oLayer.linkSprite(oSprite1)

    aObjects.sprite1 = oSprite1

    const oSprite2 = oManager.createSprite(oImg2, 36, 59, [{ x: 0, y: 0 }])
    oSprite2.x = 200
    oSprite2.y = 200
    oSprite2.alpha = 1
    oSprite2.xScale = 1
    oSprite2.yScale = 1
    oSprite2.defineRef(0, 0)
    // oLayer.linkSprite(oSprite2)

    const oSprite3 = oManager.createSprite(oImg3, 512, 512, [{ x: 0, y: 0 }])
    oSprite3.x = 0
    oSprite3.y = 0
    oSprite3.alpha = 1
    oSprite3.options.add = true
    oSprite3.xScale = 1
    oSprite3.yScale = 1
    oSprite3.defineRef(0, 0)
    // oLayer.linkSprite(oSprite3)
}

function render(time) {
    aObjects.sprite1.options.rotation += 0.01
    oManager.render()
    requestAnimationFrame(render)
}

async function main () {
    await init()
    render(0)
}

window.addEventListener('load', main)