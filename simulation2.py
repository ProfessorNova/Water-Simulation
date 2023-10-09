import pyglet
from pyglet import shapes
import random
import math
import colorsys

# Defining constants
FPS = 60
WIDTH = 800
HEIGHT = 600
GRAVITY = -300  # Gravity in pixels/s^2
DAMPING = 0.8  # Damping factor (1 means no damping)
BALL_COUNT = 10  # Number of balls
KERNEL_RADIUS = 40  # Interaction radius
REST_DENSITY = 1000  # Resting density of fluid
GAS_CONSTANT = 2000  # "Stiffness" of the gas
MAX_VELOCITY = 300  # Define a max velocity for color scaling


class Particle:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.vx = random.uniform(-200, 200)
        self.vy = random.uniform(-200, 200)
        self.density = REST_DENSITY
        self.pressure = 0

# Create initial particles
particles = [Particle(random.uniform(20, WIDTH-20), random.uniform(20, HEIGHT-20)) for _ in range(BALL_COUNT)]

def poly6_kernel(r, h):
    """ Poly6 Kernel function for density calculation """
    coefficient = 315 / (64 * math.pi * h**9)
    return coefficient * (h**2 - r**2)**3

def update_density_and_pressure():
    for particle in particles:
        # Reset density
        particle.density = 0
        for neighbor in particles:
            if neighbor is not particle:
                dx = neighbor.x - particle.x
                dy = neighbor.y - particle.y
                dist_sq = dx*dx + dy*dy
                if dist_sq < KERNEL_RADIUS**2:
                    particle.density += poly6_kernel(math.sqrt(dist_sq), KERNEL_RADIUS)
        # Compute pressure using an "ideal gas" equation of state
        particle.pressure = GAS_CONSTANT * (particle.density - REST_DENSITY)

def spiky_gradient(r, h):
    """ Spiky Kernel gradient function for pressure force calculation """
    coefficient = -45 / (math.pi * h**6)
    return coefficient * (h - r)**2

def update_forces(dt):
    for particle in particles:
        # Reset forces
        fx, fy = 0, 0
        
        for neighbor in particles:
            if neighbor is not particle:
                dx = neighbor.x - particle.x
                dy = neighbor.y - particle.y
                dist = math.sqrt(dx*dx + dy*dy)
                if 0 < dist < KERNEL_RADIUS:
                    # Pressure force contribution
                    pressure_force_magnitude = (particle.pressure + neighbor.pressure) / (2 * (neighbor.density + 1e-6)) # Added smoothing term
                    pressure_force_magnitude *= spiky_gradient(dist, KERNEL_RADIUS)
                    fx += pressure_force_magnitude * (dx / dist)
                    fy += pressure_force_magnitude * (dy / dist)
        
        # Gravity force
        fy += GRAVITY * particle.density
        
        # Update velocity and position
        particle.vx += fx / (particle.density + 1e-6) * dt  # Added smoothing term
        particle.vy += fy / (particle.density + 1e-6) * dt  # Added smoothing term
        particle.x += particle.vx * dt
        particle.y += particle.vy * dt

        # Boundary checking and response
        if particle.x < 0 or particle.x > WIDTH:
            particle.vx = -particle.vx * DAMPING
            particle.x = max(0, min(particle.x, WIDTH))  # Clamp position within bounds
        if particle.y < 0 or particle.y > HEIGHT:
            particle.vy = -particle.vy * DAMPING
            particle.y = max(0, min(particle.y, HEIGHT))  # Clamp position within bounds


# Setting up the window
window = pyglet.window.Window(WIDTH, HEIGHT)
# Create a batch for drawing
batch = pyglet.graphics.Batch()
# Create a shapes.Batch for drawing
shapes_batch = shapes.Batch()

# Create a list to hold the circles for each particle
circles = []

def velocity_to_color(velocity):
    # Normalize velocity to range [0, 1]
    normalized_velocity = min(1, (velocity / MAX_VELOCITY))
    # Convert to HSV, where hue varies with velocity
    h = 0.66 * (1 - normalized_velocity)  # Adjusted scale to go from red to blue
    s = 1
    v = 1
    # Convert HSV to RGB
    r, g, b = [int(c * 255) for c in colorsys.hsv_to_rgb(h, s, v)]
    return r, g, b

def create_circles():
    global circles
    # Clear the old circles
    circles.clear()
    # Create new circles for each particle
    for particle in particles:
        circle = shapes.Circle(particle.x, particle.y, 5, batch=shapes_batch)  # radius of 5 pixels
        circles.append(circle)

create_circles()  # Initial population of the circles

@window.event
def on_draw():
    window.clear()
    shapes_batch.draw()  # Draw all the circles in the shapes_batch

def update(dt):
    update_density_and_pressure()
    update_forces(dt)
    # Update the position and color of each circle
    for particle, circle in zip(particles, circles):
        circle.x = particle.x
        circle.y = particle.y
        velocity_magnitude = math.sqrt(particle.vx**2 + particle.vy**2)
        r, g, b = velocity_to_color(velocity_magnitude)
        circle.color = (r, g, b)

# Updating 60 times per second
pyglet.clock.schedule_interval(update, 1/FPS)
pyglet.app.run()