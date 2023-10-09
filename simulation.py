import pyglet
from pyglet.shapes import Circle
import random
import colorsys

# Defining constants
FPS = 60
WIDTH = 800
HEIGHT = 600
GRAVITY = -300  # Gravity in pixels/s^2
DAMPING = 0.75  # Damping factor (1 means no damping)
BALL_COUNT = 10  # Number of balls
MAX_VELOCITY = 300  # Define a max velocity for color scaling

# Setting up the window
window = pyglet.window.Window(WIDTH, HEIGHT)

# Creating multiple circles (our balls)
balls = [
    {
        'shape': Circle(random.uniform(20, WIDTH-20), random.uniform(20, HEIGHT-20), 10),
        'velocity': [random.uniform(-200, 200), random.uniform(-200, 200)]
    }
    for _ in range(BALL_COUNT)
]

def velocity_to_color(velocity):
    # Normalize velocity to range [0, 1]
    normalized_velocity = min(1, (velocity / MAX_VELOCITY))
    # Convert to HSV, where hue varies with velocity
    h = 0.33 - (normalized_velocity * 0.33)  # Flipping the scale
    s = 1
    v = 1
    # Convert HSV to RGB
    r, g, b = [int(c * 255) for c in colorsys.hsv_to_rgb(h, s, v)]
    return r, g, b

def update(dt):
    for ball in balls:
        # Applying gravity
        ball['velocity'][1] += GRAVITY * dt
        
        # Updating ball position
        ball['shape'].x += ball['velocity'][0] * dt
        ball['shape'].y += ball['velocity'][1] * dt
        
        # Updating ball color based on velocity
        velocity_magnitude = (ball['velocity'][0]**2 + ball['velocity'][1]**2)**0.5
        ball['shape'].color = velocity_to_color(velocity_magnitude)
        
        # Checking for collision with window borders and correcting position
        if ball['shape'].x - ball['shape'].radius < 0:
            ball['velocity'][0] = -ball['velocity'][0] * DAMPING
            ball['shape'].x = ball['shape'].radius
        elif ball['shape'].x + ball['shape'].radius > WIDTH:
            ball['velocity'][0] = -ball['velocity'][0] * DAMPING
            ball['shape'].x = WIDTH - ball['shape'].radius
        
        if ball['shape'].y - ball['shape'].radius < 0:
            ball['velocity'][1] = -ball['velocity'][1] * DAMPING
            ball['shape'].y = ball['shape'].radius
        elif ball['shape'].y + ball['shape'].radius > HEIGHT:
            ball['velocity'][1] = -ball['velocity'][1] * DAMPING
            ball['shape'].y = HEIGHT - ball['shape'].radius

@window.event
def on_draw():
    window.clear()
    for ball in balls:
        ball['shape'].draw()

# Updating the balls 60 times per second
pyglet.clock.schedule_interval(update, 1/FPS)
pyglet.app.run()
