import * as twgl from 'twgl.js'
import { autofetchShaderScripts } from './libs/autofetch-shader-scripts'

let canvas
let gl
let bgProgramInfo
let redTriangleProgramInfo
let programInfo
let bufferInfo
let bufferInfo2

async function init () {
    canvas = document.querySelector('#screen')
    gl = canvas.getContext('webgl')
    await autofetchShaderScripts(({ progress, script }) => {
        const sProgress = (progress * 100 | 0).toString() + '%'
        console.log(sProgress, script.id)
    })
    bgProgramInfo = twgl.createProgramInfo(gl, ["triangles", "horloge"])
    redTriangleProgramInfo = twgl.createProgramInfo(gl, ["triangles", "all-red"])
    programInfo = bgProgramInfo
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
        position: [
            -0.5, -0.5, 1,
            0.5, -0.5, 1,
            -0.5, 0.5, 1
        ],
    };

    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    bufferInfo2 = twgl.createBufferInfoFromArrays(gl, arrays2);
}

function render(time) {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const dNow = new Date()
    const nSeconds = dNow.getHours() * 3600 + dNow.getMinutes() * 60 + dNow.getSeconds()

    const uniforms = {
        time: time * 0.001,
        date: [0, 0, 0, nSeconds],
        resolution: [gl.canvas.width, gl.canvas.height],
    };

    gl.useProgram(bgProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, bgProgramInfo, bufferInfo);
    twgl.setUniforms(bgProgramInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);

    /*
    gl.useProgram(redTriangleProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, redTriangleProgramInfo, bufferInfo2);
    twgl.drawBufferInfo(gl, bufferInfo2);


     */
    window.requestAnimationFrame(render);
}

async function main () {
    await init()
    window.requestAnimationFrame(render)
}

window.addEventListener('load', main)
