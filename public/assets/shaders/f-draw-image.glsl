precision mediump float;

varying vec2 texcoord;
uniform sampler2D texture;

void main() {
  if (texcoord.x < 0.0 || texcoord.x > 1.0 ||
      texcoord.y < 0.0 || texcoord.y > 1.0) {
    discard;
  }
  gl_FragColor = texture2D(texture, texcoord);
}
