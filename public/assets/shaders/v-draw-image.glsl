#version 300 es

precision mediump float;

in vec4 position;

uniform mat4 u_matrix;
uniform mat4 u_textureMatrix;

out vec2 texcoord;

void main () {
  gl_Position = u_matrix * position;
  texcoord = (u_textureMatrix * position).xy;
}
