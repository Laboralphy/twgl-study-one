// we will always pass a 0 to 1 unit quad
// and then use matrices to manipulate it
attribute vec4 position;   

uniform mat4 matrix;
uniform mat4 textureMatrix;

varying vec2 texcoord;

void main () {
  gl_Position = matrix * position;
  texcoord = (textureMatrix * position).xy;
}
