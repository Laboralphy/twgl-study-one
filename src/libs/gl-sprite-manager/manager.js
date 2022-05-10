import { autofetchShaderScripts } from '../autofetch-shader-scripts'
import EventEmitter from 'events'
import * as twgl from "twgl.js";
import m4 from './m4'
import Sprite from "./sprite";

class Manager {
    constructor () {
        this._events = new EventEmitter()
        this._gl = null
        this._sprites = []
        this._programs = {}
        this._textures = {}
        this._vao = null
        this._uniforms = {
            texture: null,
            matrix: null,
            alpha: null
        }
        this._layers = []
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

    /**
     * Asynchronously loads an image and return the HTMLImageElement object
     * @param src {string} image location
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage (src) {
        return new Promise((resolve, reject) => {
            /**
             * @type {HTMLImageElement}
             */
            const oImage = new Image();
            oImage.addEventListener('load', () => {
                resolve(oImage)
            })
            oImage.addEventListener('error', () => {
                reject(new Error('ERR_IMAGE_NOT_FOUND ' + src))
            })
            oImage.src = src
        })
    }

    crop (oImage, x, y, width, height) {
        x = x || 0
        y = y || 0
        width = width || oImage.width
        height = height || oImage.height
        const oCanvas = document.createElement('canvas')
        oCanvas.width = width
        oCanvas.height = height
        const ctx = oCanvas.getContext('2d')
        ctx.drawImage(oImage, x, y, width, height, 0, 0, width, height)
        return oCanvas
    }

    createTextureInfo (oImage, x, y, width, height) {
        oImage = this.crop(oImage, x, y, width, height)
        const gl = this._gl
        const tex = twgl.createTexture(gl, {
            src: oImage,
            mag: gl.NEAREST
        });
        /*
        gl.bindTexture(gl.TEXTURE_2D, tex);

        // Fill the texture with a 1x1 blue pixel.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
*/
        const textureInfo = {
            width: 1,   // we don't know the size until it loads
            height: 1,
            texture: tex,
        };

        textureInfo.width = oImage.width;
        textureInfo.height = oImage.height;
        gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, oImage);
        gl.generateMipmap(gl.TEXTURE_2D);

        return textureInfo;
    }

    async loadImageAndCreateTextureInfo (url) {
        const r = url.match(/([^\/]+)\.(png|jpg|gif)$/i)
        const sTextureId = !!r ? r[1] : ''
        const oImage = await this.loadImage(url)
        const textureInfo = this.createTextureInfo(oImage)
        this._textures[sTextureId] = textureInfo
        return textureInfo;
    }

    renderSprites (xOffset, yOffset, sprites) {
        sprites.forEach(sprite => {
            const ti = sprite.textureInfo
            this.drawImage(
                ti.texture,
                ti.width,
                ti.height,
                sprite.x + xOffset - sprite.xRef / sprite.xScale,
                sprite.y + yOffset - sprite.yRef / sprite.yScale,
                sprite.width,
                sprite.height,
                sprite.options
            )
        })
    }

    render () {
        const gl = this._gl
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this._layers.forEach(l => l.render(this))
    }

    // Unlike images, textures do not have a width and height associated
    // with them so we'll pass in the width and height of the texture
    drawImage (tex, texWidth, texHeight, dstX, dstY, dstWidth, dstHeight, options = {}) {
        const gl = this._gl
        const textureLocation = this._uniforms.texture
        const matrixLocation = this._uniforms.matrix
        const alphaLocation = this._uniforms.alpha

        const fAlpha = options.alpha || 1

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
        let matrix = m4.orthographic(
            0, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, -1, 1);

        // translate our quad to dstX, dstY
        matrix = m4.translate(matrix, dstX, dstY, 0);

        // scale our 1 unit quad
        // from 1 unit to dstWidth, dstHeight units
        matrix = m4.scale(matrix, dstWidth, dstHeight, 1);

        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        // set alpha
        gl.uniform1f(alphaLocation, fAlpha)

        // draw the quad (2 triangles, 6 vertices)
        const offset = 0;
        const count = 6;
        gl.drawArrays(gl.TRIANGLES, offset, count);
    }

    createSprite (textureInfo) {
        const oSprite = new Sprite()
        oSprite.textureInfo = textureInfo
        oSprite.width = textureInfo.width
        oSprite.height = textureInfo.height
        this._sprites.push(oSprite)
        return oSprite
    }
}

export default Manager