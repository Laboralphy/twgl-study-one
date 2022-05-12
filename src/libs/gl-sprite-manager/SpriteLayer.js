import Layer from "./Layer";
import Geometry from './geometry'

class SpriteLayer extends Layer {
    constructor () {
        super()
        this._sprites = []
    }

    cmpRange (n, nMin, nMax) {
        return n < nMin
            ? 1
            : n > nMax
                ? 3
                : 2
    }

    cmpSegment (nSegMin, nSegMax, nRngMin, nRngMax) {
        const cMin = this.cmpRange(nSegMin, nRngMin, nRngMax)
        const cMax = this.cmpRange(nSegMax, nRngMin, nRngMax)
        return cMin * 10 + cMax
    }

    rectInRect(ax, ay, aw, ah, bx, by, bw, bh) {

    }

    rectInRect2(ax, ay, aw, ah, bx, by, bw, bh) {
        let ax2 = ax + aw - 1;
        let ay2 = ay + ah - 1;
        let bx2 = bx + bw - 1;
        let by2 = by + bh - 1;
        console.group('rectInRect')
        console.log(ax, ay, aw, ah, 'IN', bx, by, bw, bh, '?')
        console.log('ax < bx2', ax, bx2, ax < bx2)
        console.log('ax2 > bx', ax2, bx, ax2 > bx)
        console.log('ay > by2', ay, by2, ay > by2)
        console.log('ay2 < by', ay2, by, ay2 < by)
        const bOverlap = !(ax < bx2 && ax2 > bx &&
            ay > by2 && ay2 < by)
        console.log(ax, ay, aw, ah, 'IN', bx, by, bw, bh, '?', bOverlap)
        console.groupEnd('rectInRect')
        return bOverlap;
    }

    render (oManager) {
        super.render(oManager)
        const vp = this.view
        const vpx = vp.position.x - vp.offset.x
        const vpy = vp.position.y - vp.offset.y
        this
            ._sprites
            .filter(sprite => {
                const bVisible = this.rectInRect(
                    sprite.x,
                    sprite.y,
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
                    ti.texture,
                    ti.width,
                    ti.height,
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
