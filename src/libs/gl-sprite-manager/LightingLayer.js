import Layer from "./Layer";

class LightingLayer extends Layer {
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

    getVisibleLightSources () {
        const vbr = this.view.boundingRect
        const aVisibleLightSources = this._lightSources.filter(ls => )

    }
}

export default LightingLayer
