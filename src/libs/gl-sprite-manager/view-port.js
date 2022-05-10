class ViewPort {
    constructor () {
        this._x = 0
        this._y = 0
        this._width = 0
        this._height = 0
    }

    lookAt (x, y, width = undefined, height = undefined) {
        this._x = x
        this._y = y
        this._width = width || this._width
        this._height = height || this._height
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
}

export default ViewPort
