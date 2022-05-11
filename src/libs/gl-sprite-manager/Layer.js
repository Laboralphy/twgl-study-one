import { View } from './geometry'

class Layer {
    constructor () {
        this._view = new View()
        this._z = 0
    }

    get z () {
        return this._z
    }

    set z (value) {
        this._z = value
    }

    get view () {
        return this._view
    }

    render (oManager) {
    }
}

export default Layer