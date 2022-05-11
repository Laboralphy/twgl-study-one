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
            .filter(sprite => Geometry.Helper.rectInRect(
                sprite.x,
                sprite.y,
                sprite.width,
                sprite.height,
                vpx,
                vpy,
                vp.width,
                vp.height
            ))
            .sort((a, b) => {
                return b.z === a.z
                    ? b.id - a.id // pour stabiliser le sort
                    : b.z - a.z
            })
        oManager.renderSprites(-vpx, -vpy, this._sprites)
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
