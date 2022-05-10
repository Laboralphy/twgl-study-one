precision mediump float;

uniform vec2 v_position;
uniform vec2 size;

void main() {
  vec2 position = v_position;
  vec2 uv = gl_FragCoord.xy;
  if (uv.x >= position.x && uv.y >= position.y && uv.x < (position.x + size.x) && uv.y < (position.y + size.y)) {
    gl_FragColor = vec4((uv.x - position.x) / size.x, 0.0, 0.0, 1.0);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
}
