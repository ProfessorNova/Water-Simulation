let p5_instance;

let canvas_width;
let canvas_height;

let balls = [];
let gravity;
let effectRadius;
let viscosity;
let borderForce;

let mouseIsPressed = false;

function setup() {
    updateCanvasSize();

    p5_instance = createCanvas(canvas_width, canvas_height);
    p5_instance.parent("simulation-container");

    gravity = canvas_height * 0.002;
    effectRadius = canvas_width * 0.10;
    viscosity = 0.05;
    borderForce = canvas_width * 0.002;

    createBalls(180);
    p5_instance.mouseClicked(interactWithFluid);
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
    const restDensity = 90; 
    const k = 0.0005;
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

        const maxSpeed = 1000; // to prevent balls from going too fast
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
    const influenceRadius = canvas_width * 0.4;
    const forceStrength = -canvas_width;

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
    mouseIsPressed = true; // Set to true when mouse is pressed
    return false; // Prevent default browser behavior
}

function mouseReleased() {
    mouseIsPressed = false; // Reset when mouse is released
    return false; // Prevent default browser behavior
}

function windowResized() {
    updateCanvasSize();
    resizeCanvas(canvas_width, canvas_height);
    createBalls(180); // Reset the balls upon resizing
}