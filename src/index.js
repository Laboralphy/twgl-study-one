import Manager from './libs/gl-sprite-manager/Manager.js'
import SpriteLayer from "./libs/gl-sprite-manager/SpriteLayer";
import Animation from "./libs/gl-sprite-manager/Animation";

const oManager = new Manager()

const aObjects = {}

async function init () {
    await oManager.init({ canvas: document.querySelector('canvas#screen') })
    const oTombImg = await oManager.loadImage('assets/textures/sprites/TMS1A0.png')
    const oDungeonImg = await oManager.loadImage('assets/textures/dungeon-0.png')

    const oTombSpr = oManager.createSprite(oTombImg, oTombImg.width, oTombImg.height, [
        { x: 0, y: 0 }
    ])

    oTombSpr.x = 140
    oTombSpr.y = 120

    const oTorcheSpr = oManager.createSprite(oDungeonImg, 32, 32, [
        { x: 4 * 32, y: 0 },
        { x: 5 * 32, y: 0 },
        { x: 6 * 32, y: 0 },
        { x: 7 * 32, y: 0 },
        { x: 8 * 32, y: 0 }
    ])

    const oAnim0 = new Animation({
        start: 0,
        loop: Animation.LOOP.NONE
    })

    const oAnim1 = new Animation({
        start: 1,
        count: 4,
        loop: Animation.LOOP.FORWARD,
        duration: 180
    })

    oAnim1.frozen = false

    oTorcheSpr.animations[0] = oAnim0
    oTorcheSpr.animations[1] = oAnim1
    oTorcheSpr.currentAnimationIndex = 1

    oTorcheSpr.x = 100
    oTorcheSpr.y = 100

    const oLayer = new SpriteLayer()
    oLayer.view.position.x = 0
    oLayer.view.position.y = 0
    oLayer.view.width = 1000
    oLayer.view.height = 1000
    oManager.linkLayer(oLayer)
    oLayer.linkSprite(oTorcheSpr)
    oLayer.linkSprite(oTombSpr)

    aObjects.torch = oTorcheSpr
    window.aObjects = aObjects
}

let last_time = 0
function update (time) {
    const t = time - last_time
    last_time = time
    aObjects.torch.animation.animate(t)
}

function render(time) {
    update(time)
    oManager.render()
    requestAnimationFrame(render)
}

async function main () {
    await init()
    render(0)
}

window.addEventListener('load', main)
