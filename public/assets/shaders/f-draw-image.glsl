#version 300 es

precision highp float;

in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform float u_alpha;

out vec4 outColor;

void main() {
   outColor = texture(u_texture, v_texcoord);
   outColor.a *= u_alpha;
}
