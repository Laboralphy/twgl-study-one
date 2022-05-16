import Layer from "./Layer";

class LightLayer extends Layer {
    constructor() {
        super()
        this._ambiance = {
            active: false,
            pigment: [1, 1, 1]
        }
        this._lightSources = []
    }

    get lightSources () {
        return this._lightSources
    }

    get ambiance () {
        return this._ambiance
    }
}

export default LightLayer
