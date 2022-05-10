import Layer from "./layer";

class SpriteLayer extends Layer {
    constructor () {
        super()
        this._sprites = []
    }

    rectInRect (r1left, r1top, r1right, r1bottom, r2left, r2top, r2right, r2bottom) {
        return !(r2left > r1right ||
            r2right < r1left ||
            r2top > r1bottom ||
            r2bottom < r1top)
    }

    render (oManager) {
        super.render(oManager)

        const vp = this.viewport
        const vleft = vp.x
        const vtop = vp.y
        const vright = vp.x + vp.width
        const vbottom = vp.y + vp.height
        this
            ._sprites
            .filter(sprite => this.rectInRect(
                sprite.x,
                sprite.y,
                sprite.x + sprite.width,
                sprite.y + sprite.height,
                vleft,
                vtop,
                vright,
                vbottom
            ))
            .sort((a, b) => {
                return b.z - a.z
            })
        oManager.renderSprites(-vp.x, -vp.y, this._sprites)
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
