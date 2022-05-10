import * as twgl from 'twgl.js'
import { autofetchShaderScripts } from './libs/autofetch-shader-scripts'

let canvas
let gl
let bgProgramInfo
let redSquareProgramInfo
let programInfo
let bufferInfo
let bufferInfo2

function createRectObject (w, h) {
    return [
        0, 0, 0,
        0, h, 0,
        w, h, 0,
        0, 0, 0,
        w, h, 0,
        w, 0, 0
    ]
}

async function init () {
    canvas = document.querySelector('#screen')
    gl = canvas.getContext('webgl')
    await autofetchShaderScripts(({ progress, script }) => {
        const sProgress = (progress * 100 | 0).toString() + '%'
        console.log(sProgress, script.id)
    })
    bgProgramInfo = twgl.createProgramInfo(gl, ["triangles", "bgcolor-gray-20"])
    redSquareProgramInfo = twgl.createProgramInfo(gl, ["v-sprite", "f-sprite"])
    programInfo = [bgProgramInfo, redSquareProgramInfo]
    const arrays = {
        position: [
            -1, -1, 0,
            1, -1, 0,
            -1, 1, 0,
            -1, 1, 0,
            1, -1, 0,
            1, 1, 0
        ],
    };
    const arrays2 = {
        vertices: createRectObject(128, 64)
    };

    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    bufferInfo2 = twgl.createBufferInfoFromArrays(gl, arrays2);
}

function render(time) {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const dNow = new Date()
    const nSeconds = dNow.getHours() * 3600 + dNow.getMinutes() * 60 + dNow.getSeconds()

    const uniforms1 = {
        time: time * 0.001,
        date: [0, 0, 0, nSeconds],
        resolution: [gl.canvas.width, gl.canvas.height],
    };

    const uniforms2 = {
        time: time * 0.001,
        date: [0, 0, 0, nSeconds],
        reference: [0, 0],
        resolution: [gl.canvas.width, gl.canvas.height],
        f_resolution: [gl.canvas.width, gl.canvas.height],
        position: [300, 100, 1],
        sprite_position: [300, 100],
        sprite_size: [128, 64]
    };

    gl.useProgram(bgProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, bgProgramInfo, bufferInfo);
    twgl.setUniforms(bgProgramInfo, uniforms1);
    twgl.drawBufferInfo(gl, bufferInfo);

    gl.useProgram(redSquareProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, redSquareProgramInfo, bufferInfo2);
    twgl.setUniforms(redSquareProgramInfo, uniforms2);
    twgl.drawBufferInfo(gl, bufferInfo2);

    window.requestAnimationFrame(render);
}

async function main () {
    await init()
    window.requestAnimationFrame(render)
}

window.addEventListener('load', main)
