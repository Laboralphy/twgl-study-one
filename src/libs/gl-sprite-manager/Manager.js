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

    initGL () {
        const gl = twgl.getContext(this._canvas)
        this._gl = gl
        if (!this._gl) {
            throw new Error('Could not initialize webgl')
        }
        if (!twgl.isWebGL2(this._gl)) {
            throw new Error('Could not initialize webgl 2')
        }
        // gl setup
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
    }

    initShaders () {
        // fetching shaders
        return autofetchShaderScripts(({ progress, script }) => {
            this._events.emit('shader-loading', { progress, script })
        })
    }

    initDrawImage () {
        const gl = this._gl
        this._programInfo.drawImage = twgl.createProgramInfo(gl, ["v-draw-image", "f-draw-image"]);
        this._programInfo.drawImageAmbiance = twgl.createProgramInfo(gl, ["v-draw-image", "f-draw-image-ambiance"]);
        this._programInfo.drawImageLightSources = twgl.createProgramInfo(gl, ["v-draw-image", "f-draw-image-lightsources"]);

        // a unit quad
        this._bufferInfo.drawImage = twgl.primitives.createXYQuadBufferInfo(gl);
    }

    /**
     * Initialize WebGL2
     * @param canvas {HTMLCanvasElement}
     * @returns {Promise<void>}
     */
    async init ({ canvas }) {
        this._canvas = canvas
        this.initGL()
        await this.initShaders()
        this.initDrawImage()
    }

    createTextureInfo (oImage, x, y, width, height) {
        if (x !== undefined) {
            oImage = cropImage(oImage, x, y, width, height)
        }
        const gl = this._gl
        const texture = twgl.createTexture(gl, {
            src: oImage,
            mag: gl.NEAREST,
            wrapS: gl.CLAMP_TO_EDGE,
            wrapT: gl.CLAMP_TO_EDGE

        });
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, oImage);
        gl.generateMipmap(gl.TEXTURE_2D);
        return {
            width: oImage.width,
            height: oImage.height,
            texture
        }
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

        this._layers.forEach(l => l.render(this))
    }

    /**
     * @typedef Vector2D {number[2]}
     * @typedef Vector3D {number[3]}
     * @typedef Vector4D {number[4]}
     *
     * @typedef LightSourceSection {object}
     * @property active {boolean[4]}
     * @property pigment {Vector3D[4]}
     * @property position {Vector2D[4]}
     * @property radiusMin {number[4]}
     * @property radiusMax {number[4]}
     *
     * @typedef DrawImageOptions {object}
     * @property blend {number}
     * @property alpha {number}
     * @property rotation {number}
     * @property xRot {number}
     * @property yRot {number}
     * @property ambiancePigment {number[]}
     * @property lightSources {LightSourceSection}
     *
     * @param texInfo
     * @param srcX
     * @param srcY
     * @param srcWidth
     * @param srcHeight
     * @param dstX
     * @param dstY
     * @param dstWidth
     * @param dstHeight
     * @param options
     */
    drawImage (
        texInfo,
        srcX, srcY, srcWidth, srcHeight,
        dstX, dstY, dstWidth, dstHeight,
        options = {}
    ) {
        const texWidth = texInfo.width, texHeight = texInfo.height
        const tex = texInfo.texture
        const gl = this._gl
        const targetWidth = gl.canvas.width, targetHeight = gl.canvas.height
        if (options.blend === 1) {
            gl.blendFunc(gl.ONE, gl.ONE);
        } else {
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        }
        const nRotation = options.angle || 0
        if (srcWidth === undefined) {
            srcWidth = texWidth;
            srcHeight = texHeight;
        }
        if (dstX === undefined) {
            dstX = srcX;
            dstY = srcY;
            srcX = 0;
            srcY = 0;
        }
        if (dstWidth === undefined) {
            dstWidth = srcWidth;
            dstHeight = srcHeight;
        }

        const mat  = m4.identity();
        const tmat = m4.identity();

        // these adjust the unit quad to generate texture coordinates
        // to select part of the src texture

        // NOTE: no check is done that srcX + srcWidth go outside of the
        // texture or are in range in any way. Same for srcY + srcHeight

        m4.translate(tmat, [srcX / texWidth, srcY / texHeight, 0], tmat);
        m4.scale(tmat, [srcWidth / texWidth, srcHeight / texHeight, 1], tmat);

        // these convert from pixels to clip space
        m4.ortho(0, targetWidth, targetHeight, 0, -1, 1, mat)

        // these move and scale the unit quad into the size we want
        // in the target as pixels
        m4.translate(mat, [dstX, dstY, 0], mat);
        // Rotation
        if (nRotation) {
            const vPivot = v3.create(options.xRot, options.yRot, 0)
            const vNegPivot = v3.negate(vPivot)
            m4.translate(mat, vPivot, mat);
            m4.rotateZ(mat, nRotation, mat)
            m4.translate(mat, vNegPivot, mat);
        }
        m4.scale(mat, [dstWidth, dstHeight, 1], mat);

        const uniforms = {
            u_matrix: mat,
            u_textureMatrix: tmat,
            u_texture: tex,
            u_alpha: 'alpha' in options ? options.alpha : 1
        }

        let sFragmentShader = 'drawImage'

        if (Array.isArray(options.ambiancePigment)) {
            sFragmentShader = 'drawImageAmbiance'
            uniforms.u_amb_pigment = options.ambiancePigment
            if ('lightSources' in options) {
                /**
                 * @type {LightSourceSection}
                 */
                const ls = options.lightSources
                sFragmentShader = 'drawImageLightSources'
                uniforms.u_ls_active = ls.active
                uniforms.u_ls_position = ls.position.flat()
                uniforms.u_ls_pigment = ls.pigment.flat()
                uniforms.u_ls_radius_min = ls.radiusMin
                uniforms.u_ls_radius_max = ls.radiusMax
                uniforms.u_size = [texWidth, texHeight]
                uniforms.u_position = [dstX, dstY]
            }
        }

        const p = this._programInfo[sFragmentShader]
        const b = this._bufferInfo.drawImage
        gl.useProgram(p.program);
        twgl.setBuffersAndAttributes(gl, p, b);
        twgl.setUniforms(p, uniforms);
        twgl.drawBufferInfo(gl, b);
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
