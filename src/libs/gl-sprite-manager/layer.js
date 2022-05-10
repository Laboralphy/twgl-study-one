import ViewPort from "./view-port";

class Layer {
    constructor () {
        this._viewport = new ViewPort()
        this._z = 0
    }

    get z () {
        return this._z
    }

    set z (value) {
        this._z = value
    }

    get viewport () {
        return this._viewport
    }

    render (oManager) {
    }
}

export default Layer