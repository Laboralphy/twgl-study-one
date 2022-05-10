precision mediump float;

uniform vec2 sprite_position;
uniform vec2 sprite_size;

void main() {
    vec2 position = sprite_position;
    vec2 size = sprite_size;
    vec2 uv = gl_FragCoord.xy;
    if (uv.x >= position.x && uv.y >= position.y && uv.x < (position.x + size.x) && uv.y < (position.y + size.y)) {
        gl_FragColor = vec4((uv.x - position.x) / size.x, (uv.y - position.y) / size.x,  1.0 - (uv.y - position.y) / size.y, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
