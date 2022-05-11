import Animation from "./Animation";

let nSpriteLastId = 0

/**
 * @typedef TextureInfo {object}
 * @property width {number}
 * @property height {number}
 * @property texture {WebGlTexture}
 */

/**
 *
 */
class Sprite {
    constructor () {
        this._id = nSpriteLastId++
        this._x = 0
        this._y = 0
        this._width = 0
        this._height = 0
        this._z = 0
        this._xRef = 0
        this._yRef = 0
        this._angle = 0
        /**
         * List of defined animations
         * @type {Animation[]}
         * @private
         */
        this._animations = []
        /**
         * index of the current riunning animation
         * @type {number}
         * @private
         */
        this._currentAnimationIndex = 0
        /**
         * Liste of all texture info
         * @type {TextureInfo[]}
         * @private
         */
        this._textureInfos = []
        this._options = {
            alpha: 1,
            add: false,
            rotation: 0
        }
    }

    /**
     * List of all defined texture infos
     * @returns {TextureInfo[]}
     */
    get textureInfos () {
        return this._textureInfos
    }

    set textureInfos (value) {
        this._textureInfos = value
    }

    /**
     * Current running animation
     * @returns {Animation}
     */
    get animation () {
        return this._animations[this._currentAnimationIndex]
    }

    /**
     * Get the current running animation index
     * @returns {number}
     */
    get currentAnimationIndex () {
        return this._currentAnimationIndex
    }

    /**
     * Set the new current running animation index
     * @param value {number}
     */
    set currentAnimationIndex (value) {
        this._currentAnimationIndex = value
    }

    get options () {
        return this._options
    }

    get alpha() {
        return this._options.alpha;
    }

    set alpha(value) {
        this._options.alpha = value;
    }

    defineRef (fx, fy) {
        if (isNaN(this._width) || isNaN(this._height)) {
            throw new Error('ERR_INVALID_WIDTH_OR_HEIGHT')
        }
        this._xRef = Math.min(this.textureInfo.width - 1, this.textureInfo.width * fx) | 0
        this._yRef = Math.min(this.textureInfo.height - 1, this.textureInfo.height * fy) | 0
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
    }

    get z() {
        return this._z;
    }

    set z(value) {
        this._z = value;
    }

    /**
     * Returns current textureinfo pointed by current running animation
     * @returns {TextureInfo}
     */
    get textureInfo() {
        const a = this.animation
        if (a) {
            return this._textureInfos[this.animation.index];
        } else {
            return this._textureInfos[0]
        }
    }

    get xRef() {
        return this._xRef;
    }

    set xRef(value) {
        this._xRef = value;
    }

    get yRef() {
        return this._yRef;
    }

    set yRef(value) {
        this._yRef = value;
    }

    get xScale() {
        return this.textureInfo.width / this._width
    }

    set xScale(value) {
        this._width = this.textureInfo.width * value
    }

    get yScale() {
        return this.textureInfo.height / this._height
    }

    set yScale(value) {
        this._height = this.textureInfo.height * value
    }
}

export default Sprite
