#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform float u_alpha;

uniform vec3 u_amb_pigment;
uniform bool u_amb_active;

uniform bool u_ls_active[4];
uniform vec3 u_ls_pigment[4];
uniform vec2 u_ls_position[4];
uniform float u_ls_radiusMin[4];
uniform float u_ls_radiusMax[4];

out vec4 outColor;

float getIntensity(float n, float nMin, float nMax) {
    if (n <= nMin) {
        return 1.0;
    } else if (n >= nMax) {
        return 0.0;
    } else {
        float nRange = nMax - nMin;
        return (n - nMin) / nRange;
    }
}

vec4 applyLightSource(vec4 cSrcPigment, vec2 vSrcPos, int nLS) {
    // if not active, return source pigment
    if (!u_ls_active[nLS]) {
        return cSrcPigment;
    }

    vec3 cPigment = u_ls_pigment[nLS];
    vec2 vPosition = u_ls_position[nLS];
    float radiusMin = u_ls_radiusMin[nLS];
    float radiusMax = u_ls_radiusMax[nLS];

    // calculer la distance
    float nDist = distance(vSrcPos, vPosition);
    // calculer l'intensité
    float nIntensity = getIntensity(nDist, radiusMin, radiusMax);
    // calculer la couleur modifiée par intensité
    vec3 cPigment2 = cPigment * vec3(nIntensity, nIntensity, nIntensity);
    // modifier la couleur source
    vec3 colorDest = cSrcPigment.rgb + cPigment;
    return vec4(colorDest, cSrcPigment.a);
}

void main() {
    outColor = texture(u_texture, v_texcoord);
    // if (u_amb_active) {
    //     outColor = vec4(outColor.rgb * u_amb_pigment, outColor.a);
    // }
    // outColor = applyLightSource(outColor.rgb);
    outColor.a *= u_alpha;
}
