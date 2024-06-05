let p5_instance;

let canvas_width;
let canvas_height;

let balls = [];

let num_balls;
let gravity;
let effectRadius;
let viscosity;
let borderForce;
let restDensity;
let k;
let influenceRadius;
let forceStrength;

let grid;
let gridSize;

let mouseIsPressed = false;

function resetSimulation() {
  background(0); // clear the background
  createGrid();
  createBalls(num_balls); // recreate the balls
}

function setup() {
  updateCanvasSize();

  p5_instance = createCanvas(canvas_width, canvas_height);
  p5_instance.parent("simulation-container");

  if (window.innerWidth <= 768) {
    effectRadius = 40; // Replace with desired value for mobile
    document.getElementById("effectRadiusValue").textContent = effectRadius;
    document.getElementById("effectRadiusSlider").value = effectRadius; // Update the slider position
  }

  // Read initial values from sliders
  num_balls = parseInt(document.getElementById("numBallsSlider").value);
  document.getElementById("numBallsValue").textContent = num_balls;

  gravity = parseFloat(document.getElementById("gravitySlider").value);
  document.getElementById("gravityValue").textContent = gravity;

  effectRadius = parseFloat(
    document.getElementById("effectRadiusSlider").value
  );
  document.getElementById("effectRadiusValue").textContent = effectRadius;

  viscosity = parseFloat(document.getElementById("viscositySlider").value);
  document.getElementById("viscosityValue").textContent = viscosity;

  borderForce = parseFloat(document.getElementById("borderForceSlider").value);
  document.getElementById("borderForceValue").textContent = borderForce;

  restDensity = parseFloat(document.getElementById("restDensitySlider").value);
  document.getElementById("restDensityValue").textContent = restDensity;

  k = parseFloat(document.getElementById("gasConstantSlider").value);
  document.getElementById("gasConstantValue").textContent = k;

  influenceRadius = parseFloat(
    document.getElementById("influenceRadiusSlider").value
  );
  document.getElementById("influenceRadiusValue").textContent = influenceRadius;

  forceStrength = parseFloat(
    document.getElementById("forceStrengthSlider").value
  );
  document.getElementById("forceStrengthValue").textContent = forceStrength;

  // Add event listeners to the sliders
  document
    .getElementById("numBallsSlider")
    .addEventListener("input", function (e) {
      num_balls = parseInt(e.target.value);
      document.getElementById("numBallsValue").textContent = num_balls;
      resetSimulation();
    });
  document
    .getElementById("gravitySlider")
    .addEventListener("input", function (e) {
      gravity = parseFloat(e.target.value);
      document.getElementById("gravityValue").textContent = gravity;
      resetSimulation();
    });
  document
    .getElementById("effectRadiusSlider")
    .addEventListener("input", function (e) {
      effectRadius = parseFloat(e.target.value);
      document.getElementById("effectRadiusValue").textContent = effectRadius;
      resetSimulation();
    });
  document
    .getElementById("viscositySlider")
    .addEventListener("input", function (e) {
      viscosity = parseFloat(e.target.value);
      document.getElementById("viscosityValue").textContent = viscosity;
      resetSimulation();
    });
  document
    .getElementById("borderForceSlider")
    .addEventListener("input", function (e) {
      borderForce = parseFloat(e.target.value);
      document.getElementById("borderForceValue").textContent = borderForce;
      resetSimulation();
    });
  document
    .getElementById("restDensitySlider")
    .addEventListener("input", function (e) {
      restDensity = parseFloat(e.target.value);
      document.getElementById("restDensityValue").textContent = restDensity;
      resetSimulation();
    });
  document
    .getElementById("gasConstantSlider")
    .addEventListener("input", function (e) {
      k = parseFloat(e.target.value);
      document.getElementById("gasConstantValue").textContent = k;
      resetSimulation();
    });
  document
    .getElementById("influenceRadiusSlider")
    .addEventListener("input", function (e) {
      influenceRadius = parseFloat(e.target.value);
      document.getElementById("influenceRadiusValue").textContent =
        influenceRadius;
      resetSimulation();
    });
  document
    .getElementById("forceStrengthSlider")
    .addEventListener("input", function (e) {
      forceStrength = parseFloat(e.target.value);
      document.getElementById("forceStrengthValue").textContent = forceStrength;
      resetSimulation();
    });

  resetSimulation();
}

function updateCanvasSize() {
  let simulation_container = document.getElementById("simulation-container");
  canvas_width = simulation_container.offsetWidth * 0.98;
  canvas_height = simulation_container.offsetHeight * 0.98;
  console.log(canvas_height);
  console.log(canvas_width);
}

function createBalls(count) {
  balls = [];
  for (let i = 0; i < count; i++) {
    let newBall = {
      x: random(canvas_width),
      y: random(canvas_height),
      radius: canvas_width * 0.01,
      xSpeed: 0,
      ySpeed: 0,
      density: 0,
      pressure: 0,
    };
    balls.push(newBall);
    // Add the ball to the grid
    // Adjust the grid coordinates to include the offset
    let gridX = Math.floor(newBall.x / effectRadius + 2);
    let gridY = Math.floor(newBall.y / effectRadius + 2);

    // Ensure the grid position is within the new grid size
    gridX = Math.max(0, Math.min(gridX, gridSize - 1));
    gridY = Math.max(0, Math.min(gridY, gridSize - 1));

    grid[gridX][gridY].push(newBall);
  }
}

function createGrid() {
  gridSize =
    Math.ceil(Math.max(canvas_width, canvas_height) / effectRadius) + 4;
  grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => [])
  );
}

function updateGrid() {
  createGrid();
  for (let ball of balls) {
    // Calculate grid position with an offset to account for the expanded grid
    let gridX = Math.floor(ball.x / effectRadius + 2);
    let gridY = Math.floor(ball.y / effectRadius + 2);

    // Ensure the grid position is within the new grid size
    gridX = Math.max(0, Math.min(gridX, gridSize - 1));
    gridY = Math.max(0, Math.min(gridY, gridSize - 1));

    grid[gridX][gridY].push(ball);
  }
}

function drawGrid() {
  stroke(255);
  strokeWeight(1);
  for (let i = -2; i < gridSize - 2; i++) {
    line((i + 2) * effectRadius, 0, (i + 2) * effectRadius, height);
    line(0, (i + 2) * effectRadius, width, (i + 2) * effectRadius);
  }
}

function draw() {
  stroke(0);
  background(0);
  updateGrid();
  colorMode(HSL);

  // Step 1: Calculate density
  for (let ball of balls) {
    ball.density = 0;
    // Adjust the grid coordinates to include the offset
    let gridX = Math.floor(ball.x / effectRadius) + 2;
    let gridY = Math.floor(ball.y / effectRadius) + 2;
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      for (let offsetY = -1; offsetY <= 1; offsetY++) {
        let checkX = gridX + offsetX;
        let checkY = gridY + offsetY;
        if (
          checkX >= 0 &&
          checkX < gridSize &&
          checkY >= 0 &&
          checkY < gridSize
        ) {
          for (let otherBall of grid[checkX][checkY]) {
            if (ball !== otherBall) {
              let r = dist(ball.x, ball.y, otherBall.x, otherBall.y);
              if (r < effectRadius) {
                ball.density += effectRadius - r;
              }
            }
          }
        }
      }
    }
  }

  // Step 2: Calculate pressure
  for (let ball of balls) {
    ball.pressure = k * (ball.density - restDensity);
  }

  // Step 3: Interaction
  for (let ball of balls) {
    // Adjust the grid coordinates to include the offset
    let gridX = Math.floor(ball.x / effectRadius) + 2;
    let gridY = Math.floor(ball.y / effectRadius) + 2;
    for (let offsetX = -1; offsetX <= 1; offsetX++) {
      for (let offsetY = -1; offsetY <= 1; offsetY++) {
        let checkX = gridX + offsetX;
        let checkY = gridY + offsetY;
        if (
          checkX >= 0 &&
          checkX < gridSize &&
          checkY >= 0 &&
          checkY < gridSize
        ) {
          for (let otherBall of grid[checkX][checkY]) {
            if (ball !== otherBall) {
              let distance = dist(ball.x, ball.y, otherBall.x, otherBall.y);
              if (distance < effectRadius) {
                let overlap = effectRadius - distance;
                let forceMagnitude =
                  overlap * (ball.pressure + otherBall.pressure) * 0.5;
                let dx = ball.x - otherBall.x;
                let dy = ball.y - otherBall.y;
                let len = sqrt(dx * dx + dy * dy);
                dx /= len;
                dy /= len;

                if (distance < ball.radius + otherBall.radius) {
                  forceMagnitude += ball.radius + otherBall.radius - distance;
                }

                ball.xSpeed += forceMagnitude * dx;
                ball.ySpeed += forceMagnitude * dy;
                otherBall.xSpeed -= forceMagnitude * dx;
                otherBall.ySpeed -= forceMagnitude * dy;

                // Add viscosity
                let relVelX = otherBall.xSpeed - ball.xSpeed;
                let relVelY = otherBall.ySpeed - ball.ySpeed;
                ball.xSpeed += relVelX * viscosity;
                ball.ySpeed += relVelY * viscosity;
                otherBall.xSpeed -= relVelX * viscosity;
                otherBall.ySpeed -= relVelY * viscosity;
              }
            }
          }
        }
      }
    }
    // for (let j = i + 1; j < balls.length; j++) {
    //     let ballA = balls[i];
    //     let ballB = balls[j];
    //     let distance = dist(ballA.x, ballA.y, ballB.x, ballB.y);

    //     if (distance < effectRadius) {
    //         let overlap = effectRadius - distance;
    //         let forceMagnitude = overlap * (ballA.pressure + ballB.pressure) * 0.5;
    //         let dx = ballA.x - ballB.x;
    //         let dy = ballA.y - ballB.y;
    //         let len = sqrt(dx * dx + dy * dy);
    //         dx /= len;
    //         dy /= len;

    //         if (distance < ballA.radius + ballB.radius) {
    //             forceMagnitude += (ballA.radius + ballB.radius - distance);
    //         }

    //         ballA.xSpeed += forceMagnitude * dx;
    //         ballA.ySpeed += forceMagnitude * dy;
    //         ballB.xSpeed -= forceMagnitude * dx;
    //         ballB.ySpeed -= forceMagnitude * dy;

    //         // Add viscosity
    //         let relVelX = ballB.xSpeed - ballA.xSpeed;
    //         let relVelY = ballB.ySpeed - ballA.ySpeed;
    //         ballA.xSpeed += relVelX * viscosity;
    //         ballA.ySpeed += relVelY * viscosity;
    //         ballB.xSpeed -= relVelX * viscosity;
    //         ballB.ySpeed -= relVelY * viscosity;
    //     }
    // }
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
      ball.xSpeed += (borderForce * (ball.radius - leftDist)) / ball.radius;
    }
    if (rightDist < ball.radius) {
      ball.xSpeed -= (borderForce * (ball.radius - rightDist)) / ball.radius;
    }

    // Check if ball is close to the top or bottom border
    if (topDist < ball.radius) {
      ball.ySpeed += (borderForce * (ball.radius - topDist)) / ball.radius;
    }
    if (bottomDist < ball.radius) {
      ball.ySpeed -= (borderForce * (ball.radius - bottomDist)) / ball.radius;
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
  // draw a circle around the mouse
  stroke(255);
  strokeWeight(1);
  noFill();
  ellipse(mouseX, mouseY, influenceRadius * 2, influenceRadius * 2);
  for (let ball of balls) {
    const dx = ball.x - mouseX;
    const dy = ball.y - mouseY;
    const distance = sqrt(dx * dx + dy * dy);

    if (distance < influenceRadius) {
      const fx = dx / distance;
      const fy = dy / distance;

      if (forceStrength > 0) {
        ball.xSpeed += fx * (forceStrength / distance);
        ball.ySpeed += fy * (forceStrength / distance);
      } else {
        if (distance > influenceRadius * 0.6) {
          ball.xSpeed += fx * (forceStrength / distance);
          ball.ySpeed += fy * (forceStrength / distance);
        }
      }
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
