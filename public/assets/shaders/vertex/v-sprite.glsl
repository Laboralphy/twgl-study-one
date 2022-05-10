attribute vec4 vertices;

uniform vec2 resolution; // width and height of viewport (in pixels)
uniform vec2 reference; // reference point of view point (in pixels)
uniform vec3 position; // position of the region

void main() {
  float w2 = 0.5 * resolution.x;
  float h2 = 0.5 * resolution.y;
  float x = (position.x + vertices.x - reference.x) / w2 - 1.0;
  float y = (position.y + vertices.y - reference.y) / h2 - 1.0;
  gl_Position = vec4(x, y, position.z + vertices.z, vertices.w);
}
