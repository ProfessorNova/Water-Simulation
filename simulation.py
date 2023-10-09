import pyglet
import numpy as np
from pyglet.window import key
from pyglet.window import mouse

WIDTH, HEIGHT = 1280, 720
GRAVITY = 10

# opening the window
window = pyglet.window.Window(WIDTH, HEIGHT, "Simulation")

class particle:
    def __init__(self, position, mass=1):
        self.position = position
        self.velocity = np.array([0, 0])
        self.mass = mass

def update():
    global position, velocity
    velocity[1] -= GRAVITY
    position += velocity

# displaying the label
@window.event
def on_draw():
    update()
    window.clear()

# running the app
pyglet.app.run()