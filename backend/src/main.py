import moderngl
import moderngl_window as mglw
import numpy as np
import math


class RectangleApp(mglw.WindowConfig):
    gl_version = (3, 3)
    title = "Moving Rectangle"
    window_size = (800, 600)
    resource_dir = '.'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Define rectangle using 2 triangles (6 vertices)
        vertices = np.array([
            -0.5, -0.5,
             0.5, -0.5,
             0.5,  0.5,

            -0.5, -0.5,
             0.5,  0.5,
            -0.5,  0.5
        ], dtype='f4')

        vertex_shader = """
        #version 330
        in vec2 in_vert;
        uniform float offset;
        void main() {
            gl_Position = vec4(in_vert.x + offset, in_vert.y, 0.0, 1.0);
        }
        """

        fragment_shader = """
        #version 330
        out vec4 fragColor;
        void main() {
            fragColor = vec4(1.0, 1.0, 1.0, 1.0);  // white rectangle
        }
        """

        # Compile shaders
        self.prog = self.ctx.program(
            vertex_shader=vertex_shader,
            fragment_shader=fragment_shader,
        )

        # Create VBO and VAO
        vbo = self.ctx.buffer(vertices.tobytes())
        self.vao = self.ctx.vertex_array(
            self.prog,
            [(vbo, '2f', 'in_vert')],
        )

        # Get the uniform location
        self.offset = self.prog['offset']

    def on_render(self, time: float, frametime: float):
        self.ctx.clear(1.0, 0.0, 0.0, 1.0)  # Red background

        # Move the rectangle using sine wave
        x_offset = math.sin(time) * 0.5
        self.offset.value = x_offset

        self.vao.render(moderngl.TRIANGLES)


if __name__ == '__main__':
    RectangleApp.run()
