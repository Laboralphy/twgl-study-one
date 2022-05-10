import { autofetchShaderScripts } from '../autofetch-shader-scripts'
import EventEmitter from 'events'
import THObject from './th-object'

class TwglHelper {
    constructor () {
        this._events = new EventEmitter()
        this._gl = null
        this._canvas = null
        this._objects = []
    }

    get events () {
        return this._events
    }

    async init ({ canvas }) {
        this._canvas = canvas
        this._gl = canvas.getContext('webgl')
        if (!this._gl) {
            throw new Error('ERR_NO_WEBGL_FOR_YOU')
        }
        await autofetchShaderScripts(({ progress, script }) => {
            this._events.emit('shader-loading', { progress, script })
        })
    }
}

export default TwglHelper