class LightSource {
    constructor () {
        this._active = false
        this._x = 0
        this._y = 0
        this._pigment = [0, 0, 0]
        this._radiusMin = 0
        this._radiusMax = 0
        this._modified = false
        this._boundingRect = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0
        }
    }

    _computeBoundingRect () {
        const br = this._boundingRect
        br.x1 = this._x - this._radiusMax
        br.x2 = this._x + this._radiusMax
        br.y1 = this._y - this._radiusMax
        br.y2 = this._y + this._radiusMax
        this._modified = false
    }

    get boundingRect () {
        if (this._modified) {
            this._computeBoundingRect()
        }
        return this._boundingRect
    }

    setPigment (r, g, b) {
        this._pigment[0] = r
        this._pigment[1] = g
        this._pigment[2] = b
    }

    setRadius (nMin, nMax) {
        this._radiusMin = nMin
        this._radiusMax = nMax
        this._modified = true
    }

    setPosition (x, y) {
        this._x = x
        this._y = y
        this._modified = true
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get pigment() {
        return this._pigment;
    }

    get radiusMin() {
        return this._radiusMin;
    }

    get radiusMax() {
        return this._radiusMax;
    }

    set active (value) {
        this._active = value
    }

    get active () {
        return this._active
    }
}

export default LightSource
