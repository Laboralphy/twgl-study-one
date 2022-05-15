#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // Just set the output to a constant reddish-purple
  // outColor = vec4(1, 0, 0.5, 1);
  outColor = texture(u_texture, v_texcoord);
  outColor.a = 1.0;
}
