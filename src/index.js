import Manager from './libs/gl-sprite-manager/Manager.js'
import SpriteLayer from "./libs/gl-sprite-manager/SpriteLayer";

const oManager = new Manager()

const aObjects = {}

async function init () {
    await oManager.init({ canvas: document.querySelector('canvas#screen') })
    const oTombTI = await oManager.loadImage('assets/textures/sprites/TMS1A0.png')

    const oSprite1 = oManager.createSprite(oTombTI, 41, 53, [{ x: 0, y: 0 }])
    oSprite1.x = -220
    oSprite1.y = -550
    oSprite1.xScale = 1
    oSprite1.yScale = 1
    oSprite1.xPivot = 41 * 0.5
    oSprite1.yPivot = 53 * 0.5
    oSprite1.xRef = 41 / 2
    oSprite1.yRef = 53 / 2

    const oLayer = new SpriteLayer()
    oLayer.view.position.x = 0
    oLayer.view.width = 400
    oLayer.view.height = 400
    oManager.linkLayer(oLayer)
    oLayer.linkSprite(oSprite1)

    aObjects.sprite1 = oSprite1
}

let RENDER_COUNT = 0
function render(time) {
    oManager.render()
    ++RENDER_COUNT
    if (RENDER_COUNT < 20) {
        requestAnimationFrame(render)
    }
}

async function main () {
    await init()
    render(0)
}

window.addEventListener('load', main)
