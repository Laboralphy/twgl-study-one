#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec2 a_texcoord;
out vec2 v_texcoord;

uniform mat4 u_matrix;

// all shaders have a main function
void main() {

  // gl_Position is a special variable a vertex shader
  // is responsible for setting
  gl_Position = u_matrix * a_position;
  v_texcoord = a_texcoord;
}