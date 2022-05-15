import EventEmitter from 'events'
import * as twgl from "twgl.js";
const { m4, v3 } = twgl

import Sprite from "./Sprite";

import { autofetchShaderScripts } from './tools/auto-fetch-shader-scripts'
import { loadImage } from './tools/load-image'
import { cropImage } from "./tools/crop-image"

/**
 * TODO Filtrage de l'image par shader : effets de lumière, distorsion,
 */
class Manager {
    constructor () {
        this._events = new EventEmitter()
        this._gl = null
        this._sprites = []
        this._programInfo = {}
        this._bufferInfo = {}
        this._textures = {}
        this._images = {}
        this._zoom = {
            x: 1,
            y: 1
        }
        this._mOrtho = null
        this._layers = []
    }

    get gl () {
        return this._gl
    }

    get zoom () {
        return this._zoom
    }

    get textures () {
        return this._textures
    }

    get sprites () {
        return this._sprites
    }

    get events () {
        return this._events
    }

    linkLayer (oLayer) {
        oLayer.init(this)
        this._layers.push(oLayer)
        this._layers.sort((a, b) => b.z - a.z)
    }

    /**
     * Initialize WebGL2
     * @param canvas {HTMLCanvasElement}
     * @returns {Promise<void>}
     */
    async init ({ canvas }) {
        this._canvas = canvas
        this._gl = this._canvas.getContext('webgl2')
        if (!this._gl) {
            throw new Error('ERR_NO_WEBGL_FOR_YOU')
        }
        const gl = this._gl

        // gl setup
        gl.enable(gl.BLEND);

        // fetching shaders
        await autofetchShaderScripts(({ progress, script }) => {
            this._events.emit('shader-loading', { progress, script })
        })

        const arrays = {
            a_position: {
                numComponents: 2,
                data: [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]
            }
        }

        this._programInfo.drawImage = twgl.createProgramInfo(gl, ['v-test', 'f-test'])
        this._bufferInfo.drawImage = twgl.createBufferInfoFromArrays(gl, arrays)
    }

    createTextureInfo (oImage, x, y, width, height) {
        oImage = cropImage(oImage, x, y, width, height)
        const gl = this._gl
        const texture = twgl.createTexture(gl, {
            src: oImage,
            mag: gl.NEAREST,
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE
        });
        const textureInfo = {
            width: oImage.width,
            height: oImage.height,
            texture
        }
        gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, oImage);
        gl.generateMipmap(gl.TEXTURE_2D);

        return textureInfo;
    }

    /**
     * @param url {string}
     * @returns {Promise<HTMLImageElement|*>}
     */
    async loadImage (url) {
        if (url in this._images) {
            return this._images[url]
        } else {
            return this._images[url] = await loadImage(url)
        }
    }

    render () {
        const gl = this._gl
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        gl.useProgram(this._programInfo.drawImage.program);
        twgl.setBuffersAndAttributes(gl, this._programInfo.drawImage, this._bufferInfo.drawImage)
        twgl.setUniforms(
            this._programInfo.drawImage, {
            }
        )
        twgl.drawBufferInfo(this._gl, this._bufferInfo.drawImage)
    }

    /**
     * Initialise les uniform correspondant au données des lightsources
     */
    initLightSourceUniforms (pigment, position, radiusMin, radiusMax) {
        // const u = this._uniforms
        // gl.uniform
    }

    /**
     * @typedef DrawImageOptions {object}
     * @property blend {number} blend method 0: normal ; 1: additive
     * @property alpha {number} opacity : 0: transparent, 1: full opacity
     * @property xRot {number} rotation pivot coords x
     * @property yRot {number} rotation pivot coords y
     * @property angle {number} rotation angle value
     * @property xGlobal {number}
     * @property yGlobal {number}
     * @property wTex {number}
     * @property hTex {number}
     *
     *
     * @param tex
     * @param texWidth
     * @param texHeight
     * @param dstX
     * @param dstY
     * @param dstWidth
     * @param dstHeight
     * @param options
     */
    drawImage (tex, texWidth, texHeight, dstX, dstY, dstWidth, dstHeight, options = {}) {
        dstX = -1000
        dstY = -1000
        dstWidth = 5000
        dstHeight = 5000
        const gl = this._gl
        if (options.blend === 1) {
            gl.blendFunc(gl.ONE, gl.ONE);
        } else {
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }
        if (dstWidth === undefined) {
            dstWidth = texWidth;
        }

        if (dstHeight === undefined) {
            dstHeight = texHeight;
        }

        const fAlpha = options.alpha
        const fRotation = options.angle || 0

        gl.useProgram(this._programInfo.drawImage.program);

        // this matrix will convert from pixels to clip space
        let matrix = m4.copy(this._mOrtho)
        // translate our quad to dstX, dstY
        matrix = m4.translate(matrix, v3.create(dstX, dstY, 0));

        // Rotation
        if (fRotation) {
            matrix = m4.translate(matrix, v3.create(options.xRot, options.yRot, 0));
            matrix = m4.rotateZ(matrix, fRotation)
            matrix = m4.translate(matrix, v3.create(-options.xRot, -options.yRot, 0));
        }

        // scale our 1 unit quad
        // from 1 unit to dstWidth, dstHeight units
        matrix = m4.scale(matrix, v3.create(dstWidth, dstHeight, 1));

        twgl.setUniforms(
            this._programInfo.drawImage, {
                u_matrix: matrix,
                u_texture: tex,
                u_alpha: 1.0
            }
        )

        twgl.drawBufferInfo(this._gl, this._bufferInfo.drawImage)
    }

    /**
     * @param oImage {HTMLImageElement|HTMLCanvasElement}
     * @param width {number}
     * @param height {number}
     * @param aTiles {{ x: number, y:  number }[]}
     * @returns {Sprite}
     */
    createSprite (oImage, width, height, aTiles) {
        const oSprite = new Sprite()
        oSprite.textureInfos = aTiles.map(({ x, y }) => {
            return this.createTextureInfo(oImage, x, y, width, height)
        })
        oSprite.width = width
        oSprite.height = height
        this._sprites.push(oSprite)
        return oSprite
    }
}

export default Manager
