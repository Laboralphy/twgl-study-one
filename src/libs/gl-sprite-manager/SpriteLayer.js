import Layer from "./Layer";
import Geometry from './geometry'

class SpriteLayer extends Layer {
    constructor () {
        super()
        this._sprites = []
    }

    /**
     * Compare une valeur à un Range
     * @param n {number}
     * @param nMin {number}
     * @param nMax {number}
     * @returns {number}
     */
    cmpRange (n, nMin, nMax) {
        return n < nMin
            ? 1
            : n > nMax
                ? 3
                : 2
    }

    /**
     * Compare un point à un rectangle. Renvoie un indicateur de comparaison
     * @returns {number} Indicateur de comparaison. Voir valeur ci dessous
     * 1 : le point est situé "en bas à gauche" du rectangle
     * 2 : le point est situé "en bas" du rectangle
     * 3 : le point est situé "en bas à droite" du rectangle
     * 4 : le point est situé "à gauche" du rectangle
     * 5 : le point est à l'intérieur du rectangle
     * 6 : le point est situé "à droite" du rectangle
     * 7 : le point est situé "en haut à gauche" du rectangle
     * 8 : le point est situé "en haut" du rectangle
     * 9 : le point est situé "en haut à droite" du rectangle
     * @param x {number} coordonnée x du point
     * @param y {number} coordonnée y du point
     * @param rx {number} coordonnée x du point topleft du rectangle
     * @param ry {number} coordonnée y du point topleft du rectangle
     * @param rw {number} largeur du rectangle
     * @param rh {number} hauteur du rectangle
     */
    cmpPointRect (x, y, rx, ry, rw, rh) {
        const cx = this.cmpRange(x, rx, rx + rw - 1)
        const cy = this.cmpRange(y, ry, ry + rh - 1)
        const LOOK_UP_TABLE_PR = [
            [0, 0, 0, 0],
            [0, 7, 4, 1],
            [0, 8, 5, 2],
            [0, 9, 6, 3]
        ]
        switch (cx * 10 + cy) {
            case 11:
                return 7
            case 12:
                return 4
            case 13:
                return 1
            case 21:
                return 8
            case 22:
                return 5
            case 23:
                return 2
            case 31:
                return 9
            case 32:
                return 6
            case 33:
                return 3
        }
    }

    rectInRect (ax, ay, aw, ah, bx, by, bw, bh) {
        const p1 = this.cmpPointRect(ax, ay, bx, by, bw, bh)
        switch (p1) {
            case 5:
                return true
            case 1:
            case 2:
            case 3:
            case 6:
            case 9:
                return false
        }
        const p2 = this.cmpPointRect(ax + aw - 1, ay + ah - 1, bx, by, bw, bh)
        switch (p1 * 10 + p2) {
            case 77:
            case 78:
            case 79:
            case 74:
            case 71:
            case 88:
            case 89:
            case 44:
            case 41:
                return false

            default:
                return true
        }
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
        console.log(ax, ay, ax2, ay2, 'IN', bx, by, bx2, by2, '?', bOverlap)
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
                const bVisible = this.rectInRect2(
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
