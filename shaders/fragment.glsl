#version 330

in vec3 v_pos;
out vec4 fragColor;

void main() {
    float height = v_pos.y;
    fragColor = vec4(0.2 + height * 0.3, 0.4, 0.6 - height * 0.3, 1.0);
}
