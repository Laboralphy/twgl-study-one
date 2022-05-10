class THObject {
    constructor () {
        this._x = 0
        this._y = 0
        this._width = 0
        this._height = 0
        this._z = 0
        this._texture = null
        this._xTexture = 0
        this._yTexture = 0
        this._wTexture = 0
        this._hTexture = 0
        this._xRef = 0
        this._yRef = 0

        this._uniforms = {
            position: []
        }
    }
}

export default THObject
