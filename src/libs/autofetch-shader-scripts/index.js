/**
 * This function is use when you want empty <script> tags, with src attributes
 * <script type="x-shader/x-fragment" src="./assets/shaders/test.glsl"></script>
 *
 * For each <script> with "type" attribute starting with "x-shader"
 * 1) load (via fetch) the script pointed by "src" attribute
 * 2) attach the script as a text node to <script>
 *
 * @returns {Promise<HTMLScriptElement[]>}
 */
export async function autofetchShaderScripts (pProgress = null) {
    // Get all <script> with "type" attribute starting with "x-shader"
    const aNodeScripts = document.querySelectorAll('script[type^="x-shader"]')
    const aScriptPromises = []
    const nScriptCount = aNodeScripts.length
    let nScriptLoaded = 0
    const bCallProgress = typeof pProgress === 'function'
    // iterating node list
    for (let oScript of aNodeScripts) {
        // create a promise for fetching the asset
        const p = new Promise(async (resolve, reject) => {
            try {
                const src = oScript.getAttribute('src')
                const id = oScript.getAttribute('id')
                if (!id) {
                    const r = src.match(/([^\/]+)\.glsl$/i)
                    if (r) {
                        oScript.setAttribute('id', r[1])
                    }
                }
                const f = await fetch(src) // init fetch
                const s = await f.text() // get as text
                const t = document.createTextNode(s) // crete a text node
                oScript.appendChild(t) // appending the text node to the script tag
                ++nScriptLoaded
                if (bCallProgress) {
                    pProgress({
                        progress: nScriptLoaded / nScriptCount,
                        script: oScript
                    })
                }
                resolve(oScript) // promise is resolve
            } catch (e) {
                reject(e) // an error occured while fetching src... promise rejected
            }
        })
        // adding this promise to a list
        aScriptPromises.push(p)
    }
    // trying to resolve all promises
    return Promise.all(aScriptPromises)
}
