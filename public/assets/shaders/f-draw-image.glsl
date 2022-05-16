#version 300 es

precision highp float;

in vec2 texcoord;

uniform sampler2D u_texture;
uniform float u_alpha;

out vec4 outColor;

void main() {
    if (texcoord.x < 0.0 || texcoord.x > 1.0 || texcoord.y < 0.0 || texcoord.y > 1.0) {
        discard;
    }
    outColor = texture(u_texture, texcoord);
    outColor.a *= u_alpha;
}
