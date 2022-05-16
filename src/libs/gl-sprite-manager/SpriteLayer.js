import Layer from "./Layer";
import Geometry from './geometry'

class SpriteLayer extends Layer {
    constructor () {
        super()
        this._sprites = []
    }

    render (oManager) {
        super.render(oManager)
        const vp = this.view
        const vpx = vp.position.x - vp.offset.x
        const vpy = vp.position.y - vp.offset.y
        this
            ._sprites
            .filter(sprite => {
                const bVisible = Geometry.Helper.rectInRect(
                    sprite.x - sprite.xRef,
                    sprite.y - sprite.yRef,
                    sprite.width,
                    sprite.height,
                    vpx,
                    vpy,
                    vp.width,
                    vp.height
                )
                if (!bVisible) {
                    console.log('not visible',
                        sprite.x,
                        sprite.y,
                        sprite.width,
                        sprite.height,
                        vpx,
                        vpy,
                        vp.width,
                        vp.height
                    )
                }
                return bVisible
            })
            .sort((a, b) => {
                return b.z === a.z
                    ? b.id - a.id // pour stabiliser le sort
                    : b.z - a.z
            })
            .forEach(sprite => {
                const ti = sprite.textureInfo
                const xGlobal = sprite.x - sprite.xRef / sprite.xScale
                const yGlobal = sprite.y - sprite.yRef / sprite.yScale
                /**
                 * @type {DrawImageOptions}
                 */
                const options = {
                    alpha: sprite.alpha,
                    blend: sprite.blend,
                    xRot: sprite.xPivot / sprite.xScale,
                    yRot: sprite.yPivot / sprite.yScale,
                    angle: sprite.rotation,
                    xGlobal,
                    yGlobal,
                    wTex: sprite.width,
                    hTex: sprite.height,
                    lightSources: [
                        {
                            type: 'A',
                            value: [0.75, 0.55, 0.25]
                        },
                        {
                            type: 'P',
                            value: [1, 1, 1],
                            position: [0, 0, 0],
                            radius1: 100,
                            radius2: 200
                        },
                    ]
                }
                oManager.drawImage(
                    ti,
                    0, 0,
                    sprite.textureInfo.width,
                    sprite.textureInfo.height,
                    xGlobal - vpx,
                    yGlobal - vpy,
                    sprite.width,
                    sprite.height,
                    options
                )
            })
    }

    linkSprite (oSprite) {
        if (this._sprites.indexOf(oSprite) < 0) {
            this._sprites.push(oSprite)
        }
    }

    unlinkSprite (oSprite) {
        const i = this._sprites.indexOf(oSprite)
        if (i >= 0) {
            this._sprites.splice(i, 1)
        }
    }
}

export default SpriteLayer
