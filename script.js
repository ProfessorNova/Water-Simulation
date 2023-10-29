let p5_instance;

let canvas_width;
let canvas_height;

let num_balls;
let balls = [];
let gravity;
let effectRadius;
let viscosity;
let borderForce;
let restDensity;
let k;
let influenceRadius;
let forceStrength;

let mouseIsPressed = false;

function resetSimulation() {
    background(0); // clear the background
    createBalls(num_balls); // recreate the balls
}

function setup() {
    updateCanvasSize();

    p5_instance = createCanvas(canvas_width, canvas_height);
    p5_instance.parent("simulation-container");

    if (window.innerWidth <= 768) {
        effectRadius = 40;  // Replace with desired value for mobile
        document.getElementById('effectRadiusValue').textContent = effectRadius;
        document.getElementById('effectRadiusSlider').value = effectRadius;  // Update the slider position
    }

    // Read initial values from sliders
    num_balls = parseInt(document.getElementById('numBallsSlider').value);
    document.getElementById('numBallsValue').textContent = num_balls;

    gravity = parseFloat(document.getElementById('gravitySlider').value);
    document.getElementById('gravityValue').textContent = gravity;

    effectRadius = parseFloat(document.getElementById('effectRadiusSlider').value);
    document.getElementById('effectRadiusValue').textContent = effectRadius;

    viscosity = parseFloat(document.getElementById('viscositySlider').value);
    document.getElementById('viscosityValue').textContent = viscosity;

    borderForce = parseFloat(document.getElementById('borderForceSlider').value);
    document.getElementById('borderForceValue').textContent = borderForce;

    restDensity = parseFloat(document.getElementById('restDensitySlider').value);
    document.getElementById('restDensityValue').textContent = restDensity;

    k = parseFloat(document.getElementById('gasConstantSlider').value);
    document.getElementById('gasConstantValue').textContent = k;

    influenceRadius = parseFloat(document.getElementById('influenceRadiusSlider').value);
    document.getElementById('influenceRadiusValue').textContent = influenceRadius;

    forceStrength = parseFloat(document.getElementById('forceStrengthSlider').value);
    document.getElementById('forceStrengthValue').textContent = forceStrength;


    // Add event listeners to the sliders
    document.getElementById('numBallsSlider').addEventListener('input', function(e) {
        num_balls = parseInt(e.target.value);
        document.getElementById('numBallsValue').textContent = num_balls;
        resetSimulation();
    });
    document.getElementById('gravitySlider').addEventListener('input', function(e) {
        gravity = parseFloat(e.target.value);
        document.getElementById('gravityValue').textContent = gravity;
        resetSimulation();
    });
    document.getElementById('effectRadiusSlider').addEventListener('input', function(e) {
        effectRadius = parseFloat(e.target.value);
        document.getElementById('effectRadiusValue').textContent = effectRadius;
        resetSimulation();
    });
    document.getElementById('viscositySlider').addEventListener('input', function(e) {
        viscosity = parseFloat(e.target.value);
        document.getElementById('viscosityValue').textContent = viscosity;
        resetSimulation();
    });
    document.getElementById('borderForceSlider').addEventListener('input', function(e) {
        borderForce = parseFloat(e.target.value);
        document.getElementById('borderForceValue').textContent = borderForce;
        resetSimulation();
    });
    document.getElementById('restDensitySlider').addEventListener('input', function(e) {
        restDensity = parseFloat(e.target.value);
        document.getElementById('restDensityValue').textContent = restDensity;
        resetSimulation();
    });
    document.getElementById('gasConstantSlider').addEventListener('input', function(e) {
        k = parseFloat(e.target.value);
        document.getElementById('gasConstantValue').textContent = k;
        resetSimulation();
    });
    document.getElementById('influenceRadiusSlider').addEventListener('input', function(e) {
        influenceRadius = parseFloat(e.target.value);
        document.getElementById('influenceRadiusValue').textContent = influenceRadius;
        resetSimulation();
    });
    document.getElementById('forceStrengthSlider').addEventListener('input', function(e) {
        forceStrength = parseFloat(e.target.value);
        document.getElementById('forceStrengthValue').textContent = forceStrength;
        resetSimulation();
    });

    resetSimulation();
}

function updateCanvasSize() {
    let simulation_container = document.getElementById("simulation-container");
    canvas_width = simulation_container.offsetWidth * 0.98;
    canvas_height = simulation_container.offsetHeight * 0.98;
}

function createBalls(count) {
    balls = [];
    for (let i = 0; i < count; i++) {
        let newBall = {
            x: random(canvas_width),
            y: random(canvas_height),
            radius: canvas_width * 0.02,
            xSpeed: 0,
            ySpeed: 0,
            density: 0,
            pressure: 0
        };
        balls.push(newBall);
    }
}

function draw() {
    background(0);
    colorMode(HSL);

    // Step 1: Calculate density
    for (let ball of balls) {
        ball.density = 0;
        for (let otherBall of balls) {
            if (ball !== otherBall) {
                let r = dist(ball.x, ball.y, otherBall.x, otherBall.y);
                if (r < effectRadius) {
                    ball.density += effectRadius - r;  
                }
            }
        }
    }
  
    // Step 2: Calculate pressure
    for (let ball of balls) {
        ball.pressure = k * (ball.density - restDensity);
    }

    // Step 3: Interaction
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let ballA = balls[i];
            let ballB = balls[j];
            let distance = dist(ballA.x, ballA.y, ballB.x, ballB.y);
            
            if (distance < effectRadius) {
                let overlap = effectRadius - distance;
                let forceMagnitude = overlap * (ballA.pressure + ballB.pressure) * 0.5;
                let dx = ballA.x - ballB.x;
                let dy = ballA.y - ballB.y;
                let len = sqrt(dx * dx + dy * dy);
                dx /= len;
                dy /= len;
                
                if (distance < ballA.radius + ballB.radius) {  
                    forceMagnitude += (ballA.radius + ballB.radius - distance);
                }
                
                ballA.xSpeed += forceMagnitude * dx;
                ballA.ySpeed += forceMagnitude * dy;
                ballB.xSpeed -= forceMagnitude * dx;
                ballB.ySpeed -= forceMagnitude * dy;

                // Add viscosity
                let relVelX = ballB.xSpeed - ballA.xSpeed;
                let relVelY = ballB.ySpeed - ballA.ySpeed;
                ballA.xSpeed += relVelX * viscosity;
                ballA.ySpeed += relVelY * viscosity;
                ballB.xSpeed -= relVelX * viscosity;
                ballB.ySpeed -= relVelY * viscosity;
            }
        }
    }

    // Move and draw balls
    for (let ball of balls) {

        // Distance from each border
        let leftDist = ball.x;
        let rightDist = width - ball.x;
        let topDist = ball.y;
        let bottomDist = height - ball.y;

        // Check if ball is close to the left or right border
        if (leftDist < ball.radius) {
            ball.xSpeed += borderForce * (ball.radius - leftDist) / ball.radius;
        }
        if (rightDist < ball.radius) {
            ball.xSpeed -= borderForce * (ball.radius - rightDist) / ball.radius;
        }

        // Check if ball is close to the top or bottom border
        if (topDist < ball.radius) {
            ball.ySpeed += borderForce * (ball.radius - topDist) / ball.radius;
        }
        if (bottomDist < ball.radius) {
            ball.ySpeed -= borderForce * (ball.radius - bottomDist) / ball.radius;
        }

        ball.ySpeed += gravity;

        const maxSpeed = 500; // to prevent balls from going too fast
        ball.xSpeed = constrain(ball.xSpeed, -maxSpeed, maxSpeed);
        ball.ySpeed = constrain(ball.ySpeed, -maxSpeed, maxSpeed);

        let speed = sqrt(ball.xSpeed * ball.xSpeed + ball.ySpeed * ball.ySpeed);
        let hueValue = map(speed, 0, 10, 250, 350);

        fill(hueValue, 100, 50);
        ellipse(ball.x, ball.y, ball.radius * 2, ball.radius * 2);

        ball.x += ball.xSpeed;
        ball.y += ball.ySpeed;
    }

    if (mouseIsPressed) {
        interactWithFluid(); // Apply the force if mouse is pressed
    }
}

function interactWithFluid() {
    for (let ball of balls) {
        const dx = ball.x - mouseX;
        const dy = ball.y - mouseY;
        const distance = sqrt(dx * dx + dy * dy);
      
        if (distance < influenceRadius) {
            const fx = dx / distance;
            const fy = dy / distance;
  
            ball.xSpeed += fx * (forceStrength / distance);
            ball.ySpeed += fy * (forceStrength / distance);
        }
    }
}

function mousePressed() {
    mouseIsPressed = true;
    return true;
}

function mouseReleased() {
    mouseIsPressed = false;
    return true;
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvas_width, canvas_height);
    resetSimulation();
}