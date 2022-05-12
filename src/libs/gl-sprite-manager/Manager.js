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
        this._programs = {}
        this._textures = {}
        this._images = {}
        this._vao = null
        this._uniforms = {
            texture: null,
            matrix: null,
            alpha: null
        }
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
        this._gl = canvas.getContext('webgl2')
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

        // compiling drawimage shaders
        const progDrawImage = this.compileProgram('drawImage', 'v-draw-image', 'f-draw-image')

        // draw image : look up where the vertex data needs to go.
        const positionAttributeLocation = gl.getAttribLocation(progDrawImage.program, 'a_position');
        const texcoordAttributeLocation = gl.getAttribLocation(progDrawImage.program, 'a_texcoord');

        // lookup uniforms
        this._uniforms.matrix = gl.getUniformLocation(progDrawImage.program, 'u_matrix');
        this._uniforms.texture = gl.getUniformLocation(progDrawImage.program, 'u_texture');
        this._uniforms.alpha = gl.getUniformLocation(progDrawImage.program, 'u_alpha');

        // Create a vertex array object (attribute state)
        const vao = gl.createVertexArray();
        this._vao = vao

        // and make it the one we're currently working with
        gl.bindVertexArray(vao);

        // create the position buffer, make it the current ARRAY_BUFFER
        // and copy in the color values
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Put a unit quad in the buffer
        const positions = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        this.createVertexAttribPointer({
            attributeLocation: positionAttributeLocation,
            size: 2, // 2 components per iteration
            type: gl.FLOAT, // the data is 32bit floats
            normalize: false, // don't normalize the data
            stride: 0, // 0 = move forward size * sizeof(type) each iteration to get the next position
            offset: 0 // start at the beginning of the buffer
        })

        // create the texcoord buffer, make it the current ARRAY_BUFFER
        // and copy in the texcoord values
        const texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        // Put texcoords in the buffer
        const texcoords = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

        // Turn on the attribute
        gl.enableVertexAttribArray(texcoordAttributeLocation);

        // Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
        this.createVertexAttribPointer({
            attributeLocation: texcoordAttributeLocation,
            size: 2, // 2 components per iteration
            type: gl.FLOAT, // the data is 32bit floats
            normalize: false, // convert from 0-255 to 0.0-1.0
            stride: 0, // 0 = move forward size * sizeof(type) each iteration to get the next color
            offset: 0 // start at the beginning of the buffer
        })
    }

    createVertexAttribPointer ({ attributeLocation, size, type, normalize, stride, offset }) {
        this._gl.vertexAttribPointer(
            attributeLocation,
            size,
            type,
            normalize,
            stride,
            offset
        )
    }

    /**
     * Compile a vs script and a fs script and returns the program info
     * @param id {string} program identifier
     * @param vsScript {string}
     * @param fsScript {string}
     */
    compileProgram (id, vsScript, fsScript) {
        const programInfo = twgl.createProgramInfo(this._gl, [vsScript, fsScript])
        this._programs[id] = programInfo
        return programInfo
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

        this._mOrtho = m4.ortho(
            0,
            gl.canvas.clientWidth / this._zoom.x,
            gl.canvas.clientHeight / this._zoom.y,
            0,
            -1,
            1
        );
        this._layers.forEach(l => l.render(this))
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
        const gl = this._gl
        switch (options.blend) {
            case 1: {
                gl.blendFunc(gl.ONE, gl.ONE);
                break;
            }

            default: {
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                break;
            }
        }
        const textureLocation = this._uniforms.texture
        const matrixLocation = this._uniforms.matrix
        const alphaLocation = this._uniforms.alpha

        const fAlpha = options.alpha
        const fRotation = options.angle || 0

        if (dstWidth === undefined) {
            dstWidth = texWidth;
        }

        if (dstHeight === undefined) {
            dstHeight = texHeight;
        }

        gl.useProgram(this._programs.drawImage.program);

        // Setup the attributes for the quad
        const vao = this._vao
        gl.bindVertexArray(vao);

        const textureUnit = 0;
        // The the shader we're putting the texture on texture unit 0
        gl.uniform1i(textureLocation, textureUnit);

        // Bind the texture to texture unit 0
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, tex);

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

        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        // set alpha
        gl.uniform1f(alphaLocation, fAlpha)

        // draw the quad (2 triangles, 6 vertices)
        const offset = 0;
        const count = 6;
        gl.drawArrays(gl.TRIANGLES, offset, count);
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
