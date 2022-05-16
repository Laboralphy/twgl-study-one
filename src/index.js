import Manager from './libs/gl-sprite-manager/Manager.js'
import SpriteLayer from "./libs/gl-sprite-manager/SpriteLayer";
import Animation from "./libs/gl-sprite-manager/Animation";

const oManager = new Manager()

const oAllSprites = {}

async function createTorchSprite(oImg) {
    const oTorchSpr = await oManager.createSprite(oImg, 32, 32, [
        {
            x: 4 * 32,
            y: 0
        }, {
            x: 5 * 32,
            y: 0
        }, {
            x: 6 * 32,
            y: 0
        }, {
            x: 7 * 32,
            y: 0
        }, {
            x: 8 * 32,
            y: 0
        }
    ])
    oTorchSpr.animations[0] = new Animation()
    oTorchSpr.animations[1] = new Animation({
        start: 1,
        duration: 100,
        count: 4,
        loop: Animation.LOOP.FORWARD
    })
    oTorchSpr.currentAnimationIndex = 1
    oTorchSpr.x = 100
    oTorchSpr.y = 100
    oTorchSpr.xScale = oTorchSpr.yScale = 3
    oTorchSpr.rotation = 1
    oTorchSpr.xPivot = 16
    oTorchSpr.yPivot = 16
    oTorchSpr.alpha = 1
    return oTorchSpr
}

async function init () {
    await oManager.init({ canvas: document.querySelector('canvas#screen') })
    const oDungeonImg = await oManager.loadImage('./assets/textures/dungeon-0.png')
    const oTorchSpr = await createTorchSprite(oDungeonImg)
    oAllSprites.torch = oTorchSpr
    const oTorchSpr2 = await createTorchSprite(oDungeonImg)
    oAllSprites.torch2 = oTorchSpr2
    oTorchSpr2.x += 16
    oTorchSpr2.y += 10

    const oLayer = new SpriteLayer()
    oLayer.linkSprite(oTorchSpr)
    oLayer.linkSprite(oTorchSpr2)
    oLayer.view.width = 1000
    oLayer.view.height = 1000
    oLayer.view.position.set(0, 0)
    oLayer.view.offset.set(0, 0)
    oManager.linkLayer(oLayer)
}

let last_time = 0
function update (time) {
    const t = time - last_time
    last_time = time
    oAllSprites.torch.rotation = time / 1000
    oAllSprites.torch.animation.animate(t)
    oAllSprites.torch2.rotation = -time / 1500
    oAllSprites.torch2.animation.animate(t)
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
