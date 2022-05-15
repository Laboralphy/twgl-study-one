#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform float u_alpha;

out vec4 outColor;

void main() {
    outColor = texture(u_texture, v_texcoord);
    outColor.a *= u_alpha;
    outColor = vec4(1.0, 0.0, 0.0, 1.0);
}
