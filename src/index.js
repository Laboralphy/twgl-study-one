import Manager from './libs/gl-sprite-manager/Manager.js'
import SpriteLayer from "./libs/gl-sprite-manager/SpriteLayer";
import Animation from "./libs/gl-sprite-manager/Animation";

const oManager = new Manager()

const oAllSprites = {}

async function init () {
    await oManager.init({ canvas: document.querySelector('canvas#screen') })
    const oDungeonImg = await oManager.loadImage('./assets/textures/dungeon-0.png')
    const oTorchSpr = await oManager.createSprite(oDungeonImg, 32, 32, [
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
    oTorchSpr.currentAnimationIndex = 0
    oTorchSpr.x = 100
    oTorchSpr.y = 100

    oAllSprites.torch = oTorchSpr

    const oLayer = new SpriteLayer()
    oLayer.linkSprite(oTorchSpr)
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
    oAllSprites.torch.animation.animate(t)
}

function render(time) {
    update(time)
    oManager.render()
    oManager.drawImage(oAllSprites.torch.textureInfos[0],
        0, 0,
        oAllSprites.torch.textureInfos[0].width, oAllSprites.torch.textureInfos[0].height,
        200, 200,
        oAllSprites.torch.textureInfos[0].width, oAllSprites.torch.textureInfos[0].height,
            {angle: 1, xRot: 16, yRot: 16}
        )
    requestAnimationFrame(render)
}

async function main () {
    await init()
    render(0)
}

window.addEventListener('load', main)
