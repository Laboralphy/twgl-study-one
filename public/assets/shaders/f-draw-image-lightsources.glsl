#version 300 es

precision highp float;

in vec2 texcoord;

uniform sampler2D u_texture;
uniform float u_alpha;
uniform vec3 u_amb_pigment;
uniform bool u_ls_active[4];
uniform vec2 u_ls_position[4];
uniform vec3 u_ls_pigment[4];
uniform float u_ls_radius_min[4];
uniform float u_ls_radius_max[4];
uniform vec2 u_size;
uniform vec2 u_position;

out vec4 outColor;

float getIntensity(vec2 vPixelPos, int nLS) {
    vec2 lsPos = u_ls_position[nLS];
    vec3 lsPigment = u_ls_pigment[nLS];
    float lsRadiusMin = u_ls_radius_min[nLS];
    float lsRadiusMax = u_ls_radius_max[nLS];
    float nDistance = distance(vPixelPos, lsPos);
    return 1.0 - clamp((nDistance - lsRadiusMin) / (lsRadiusMax - lsRadiusMin), 0.0, 1.0);
}

vec4 mixPigments(vec4 vOrigPigment, vec4 vLightPigment) {
    float nIntensity = vLightPigment.a;
    return vec4(
        clamp(vOrigPigment.r + nIntensity * vLightPigment.r, 0.0, 1.0),
        clamp(vOrigPigment.g + nIntensity * vLightPigment.g, 0.0, 1.0),
        clamp(vOrigPigment.b + nIntensity * vLightPigment.b, 0.0, 1.0),
        vOrigPigment.a
    );
}

vec4 applyAmbiantLight(vec4 vOrigPigment) {
    return vec4(
        u_amb_pigment.r * vOrigPigment.r,
        u_amb_pigment.g * vOrigPigment.g,
        u_amb_pigment.b * vOrigPigment.b,
        vOrigPigment.a * u_alpha
    );
}

vec4 applyLightSources(vec4 vOrigPigment, vec2 vPixelPos) {
    float nIntensity;
    vec4 vFinalPigment = vOrigPigment;
    vec4 vLSPigment;
    for (int i = 0; i < 4; ++i) {
        if (u_ls_active[i]) {
            nIntensity = getIntensity(vPixelPos, i);
            if (nIntensity > 0.0) {
                vLSPigment = vec4(u_ls_pigment[i], nIntensity);
                vFinalPigment = mixPigments(vFinalPigment, vLSPigment);
            }
        }
    }
    return vFinalPigment;
}

void main() {
    if (texcoord.x < 0.0 || texcoord.x > 1.0 || texcoord.y < 0.0 || texcoord.y > 1.0) {
        discard;
    }
    vec2 vPosLocal = vec2(texcoord.x * u_size.x, texcoord.y * u_size.y);
    outColor = texture(u_texture, texcoord);
    outColor = applyAmbiantLight(outColor);
    outColor = applyLightSources(outColor, u_position + vPosLocal);

}
