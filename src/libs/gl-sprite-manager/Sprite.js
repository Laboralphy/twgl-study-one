import Animation from "./Animation";

let nSpriteLastId = 0

/**
 * @typedef TextureInfo {object}
 * @property width {number}
 * @property height {number}
 * @property texture {WebGlTexture}
 *
 * @typedef SpriteOptionRotation {object}
 * @property x {number} pivot coordinates (x)
 * @property y {number} pivot coordinates (y)
 * @property angle {number} rotation angle (rad)
 *
 * @typedef SpriteOptions {object}
 * @property alpha {number} alpha transparency from 0 (transparent) to 1 (full opacity)
 * @property blend {number} blend mode - 0=normal 1=additive
 * @property rotation {SpriteOptionRotation}
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
        this._xPivot = 0
        this._yPivot = 0
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
        this._rotation = 0
        this._alpha = 1
        this._blend = 0
    }

    get xPivot() {
        return this._xPivot;
    }

    set xPivot(value) {
        this._xPivot = value;
    }

    get yPivot() {
        return this._yPivot;
    }

    set yPivot(value) {
        this._yPivot = value;
    }

    get rotation () {
        return this._rotation
    }

    set rotation (value) {
        this._rotation = value
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
     * all defined animations
     * @returns {Animation[]}
     */
    get animations () {
        return this._animations
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
        if (this._animations[value] === undefined) {
            throw new Error('Animation #' + value + ' is undefined')
        }
        this._currentAnimationIndex = value
    }

    get alpha() {
        return this._alpha;
    }

    set alpha(value) {
        this._alpha = value;
    }

    get blend() {
        return this._blend;
    }

    set blend(value) {
        this._blend = value;
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
        this.xPivot = this.xPivot
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
        this.yPivot = this.yPivot
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
            return this._textureInfos[this.animation.frame];
        } else {
            return this._textureInfos[0]
        }
    }

    get xRef() {
        return this._xRef;
    }

    set xRef(value) {
        this._xRef = Math.min(this.textureInfo.width - 1, value) | 0
    }

    get yRef() {
        return this._yRef;
    }

    set yRef(value) {
        this._yRef = Math.min(this.textureInfo.height - 1, value) | 0
    }

    get xScale() {
        return this.textureInfo.width / this._width
    }

    set xScale(value) {
        this._width = this.textureInfo.width * value
        this.xPivot = this.xPivot
    }

    get yScale() {
        return this.textureInfo.height / this._height
    }

    set yScale(value) {
        this._height = this.textureInfo.height * value
        this.yPivot = this.yPivot
    }

    set scale (value) {
        this.xScale = this.yScale = value
    }
}

export default Sprite
