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

out vec4 outColor;

float getIntensity(vec2 vPixelPos, uint nLS) {
    if (!u_ls_active[nLS]) {
        return 0;
    }
    vec2 lsPos = u_ls_position[nLS];
    vec3 lsPigment = u_ls_pigment[nLS];
    float lsRadiusMin = u_ls_radius_min[nLS];
    float lsRadiusMax = u_ls_radius_max[nLS];
    float nDistance = distance(vPixelPos, lsPos);
    float nIntensity = max(0.0, min(1.0, (nDistance - lsRadiusMin) / (lsRadiusMax - lsRadiusMin)));
}

vec4 getEnlightedPigment(vec4 vOrigPigment, vec3 vLightPigment, float nIntensity) {
    return vec3(
        min(1.0, vOrigPigment.r + nIntensity * vLightPigment.r),
        min(1.0, vOrigPigment.g + nIntensity * vLightPigment.g),
        min(1.0, vOrigPigment.b + nIntensity * vLightPigment.b),
        vOrigPigment.a
    );
}

vec4 applyLightSources(vec4 vOrigPigment)

void main() {
    if (texcoord.x < 0.0 || texcoord.x > 1.0 || texcoord.y < 0.0 || texcoord.y > 1.0) {
        discard;
    }
    outColor = texture(u_texture, texcoord);
    outColor = vec4(
        u_amb_pigment.r * outColor.r,
        u_amb_pigment.g * outColor.g,
        u_amb_pigment.b * outColor.b,
        outColor.a * u_alpha
    );
}
