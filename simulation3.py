import pyglet
from pyglet import shapes
import random
import numpy as np
import colorsys

# Defining constants
FPS = 60
WIDTH = 800
HEIGHT = 600
GRAVITY = 0  # Gravity in pixels/s^2
DAMPING = 0.8  # Damping factor (1 means no damping)
PARTICLE_COUNT = 100  # Number of balls
PARTICLE_SIZE = 5  # Particle size
SMOOTHING_RADIUS = 40  # Interaction radius

class Particle:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.vx = 0
        self.vy = 0
        self.pressure = 0

def smoothing_kernel(radius, dst):
    volume = np.pi * radius**8 / 4
    value = np.argmax(0, radius**2 - dst**2)
    return value**3 / volume

def calculate_density():
    density = 0
    mass = 1

    for particle in particles:
        dst = np.linalg.norm(np.array([particle.x, particle.y]) - np.array([particle.x, particle.y]))
        influence = smoothing_kernel(SMOOTHING_RADIUS, dst)
        density += mass * influence

    return density

def update(dt):
    for particle in particles:
        # Applying gravity
        particle.vy += GRAVITY * dt
        resolve_collision()

        # Updating ball position
        particle.x += particle.vx * dt
        particle.y += particle.vy * dt

def resolve_collision():
    for particle in particles:
        if particle.x - PARTICLE_SIZE < 0:
            particle.vx = -particle.vx * DAMPING
            particle.x = PARTICLE_SIZE
        elif particle.x + PARTICLE_SIZE > WIDTH:
            particle.vx = -particle.vx * DAMPING
            particle.x = WIDTH - PARTICLE_SIZE

        if particle.y - PARTICLE_SIZE < 0:
            particle.vy = -particle.vy * DAMPING
            particle.y = PARTICLE_SIZE
        elif particle.y + PARTICLE_SIZE > HEIGHT:
            particle.vy = -particle.vy * DAMPING
            particle.y = HEIGHT - PARTICLE_SIZE

def init_particles():
    particles = [Particle(random.uniform(20, WIDTH-20), random.uniform(20, HEIGHT-20)) for _ in range(PARTICLE_COUNT)]

    return particles

# Setting up the window
window = pyglet.window.Window(WIDTH, HEIGHT)

particles = init_particles()

@window.event
def on_key_press(symbol, modifiers):
    if symbol == pyglet.window.key.R:
        particles.clear()
        particles.extend(init_particles())

@window.event
def on_draw():
    window.clear()
    for particle in particles:
        shapes.Circle(particle.x, particle.y, PARTICLE_SIZE, color=(0, 100, 255)).draw()

pyglet.clock.schedule_interval(update, 1/FPS)
pyglet.app.run()