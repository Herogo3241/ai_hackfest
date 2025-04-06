#version 330

in vec3 in_position;
uniform float amplitude;
uniform float time;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec3 v_pos;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}

void main() {
    vec3 pos = in_position;
    float freq = 2.0;
    float amp = amplitude * 5.0;

    pos.y += noise(vec2(pos.x * freq + time, pos.z * freq)) * amp;

    v_pos = pos;
    gl_Position = projection * view * model * vec4(pos, 1.0);
}
