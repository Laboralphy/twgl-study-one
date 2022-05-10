let nSpriteLastId = 0

class Sprite {
    constructor () {
        this._id = nSpriteLastId++
        this._x = 0
        this._y = 0
        this._width = 0
        this._height = 0
        this._z = 0
        this._textureInfo = null
        this._xRef = 0
        this._yRef = 0
        this._options = {
            alpha: 1
        }
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
        this._xRef = Math.min(this._textureInfo.width - 1, this._textureInfo.width * fx) | 0
        this._yRef = Math.min(this._textureInfo.height - 1, this._textureInfo.height * fy) | 0
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

    get textureInfo() {
        return this._textureInfo;
    }

    set textureInfo(value) {
        this._textureInfo = value;
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
        return this._textureInfo.width / this._width
    }

    set xScale(value) {
        this._width = this._textureInfo.width * value
    }

    get yScale() {
        return this._textureInfo.height / this._height
    }

    set yScale(value) {
        this._height = this._textureInfo.height * value
    }
}

export default Sprite
