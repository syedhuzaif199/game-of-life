const panOffset = { x: 0, y: 0 };
let scale = 1;
const cellSize = 24;
const grid = {};
let mousedown = false;
let panning = false;
let mousedragging = false;
document.addEventListener("DOMContentLoaded", main);
let keydown = null;
let simulating = false;

function main() {
  const canvas = document.getElementById("canvas");
  const canvasDiv = document.querySelector(".canvas-div");
  canvas.width = canvasDiv.offsetWidth * 0.9;
  canvas.height = canvasDiv.offsetHeight * 0.9;

  draw(canvas);

  window.addEventListener("keydown", (e) => {
    keydown = e.key;
  });

  document.getElementById("clear").addEventListener("click", () => {
    console.log("clear");
    for (let key in grid) {
      delete grid[key];
    }
    draw(canvas);
  });

  document.getElementById("next").addEventListener("click", () => {
    nextGen();
    draw(canvas);
  });

  const startBtn = document.getElementById("start");
  startBtn.addEventListener("click", () => {
    simulating = !simulating;
    if (simulating) {
      startBtn.innerHTML = "Stop";
    } else {
      startBtn.innerHTML = "Start";
    }
    let count = 0;
    const intr = setInterval(() => {
      console.log("simulating");
      nextGen();
      draw(canvas);
      if (!simulating) {
        clearInterval(intr);
      }
    }, 100);
  });

  window.addEventListener("keyup", (e) => {
    keydown = null;
  });

  canvas.addEventListener("mousedown", (e) => {
    mousedown = true;
  });

  canvas.addEventListener("mouseup", (e) => {
    mousedown = false;
    if (panning || mousedragging) {
      panning = false;
      mousedragging = false;
      console.log(panning, mousedragging);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellX = Math.floor((x - panOffset.x) / cellSize);
    const cellY = Math.floor((y - panOffset.y) / cellSize);
    console.log(cellX, cellY);
    updateGrid(canvas, cellX, cellY, true);
    console.log(grid[`${cellX},${cellY}`]);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (mousedown) {
      mousedragging = true;
    }
    if (mousedown && keydown === " ") {
      panning = true;
      const rect = canvas.getBoundingClientRect();
      panOffset.x += e.movementX;
      panOffset.y += e.movementY;
      draw(canvas);
    }
  });

  canvas.addEventListener("mouseleave", (e) => {
    console.log("mouseleave");
    mousedown = false;
    mousedragging = false;
    panning = false;
  });

  window.addEventListener("resize", () => {
    canvas.width = canvasDiv.offsetWidth * 0.9;
    canvas.height = canvasDiv.offsetHeight * 0.9;
    console.log("resize");
    draw(canvas);
  });
}

function draw(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const rect = canvas.getBoundingClientRect();
  ctx.strokeStyle = "black";
  for (let i = 0; i < canvas.width; i += cellSize) {
    ctx.beginPath();
    ctx.moveTo(i + (panOffset.x % cellSize), 0);
    ctx.lineTo(i + (panOffset.x % cellSize), rect.height);
    ctx.stroke();
  }
  for (let j = 0; j < canvas.height; j += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, j + (panOffset.y % cellSize));
    ctx.lineTo(rect.width, j + (panOffset.y % cellSize));
    ctx.stroke();
  }

  for (let key in grid) {
    const [x, y] = key.split(",");
    if (!grid[key]) continue;
    ctx.fillRect(
      x * cellSize + panOffset.x,
      y * cellSize + panOffset.y,
      cellSize,
      cellSize
    );
    ctx.strokeStyle = "gray";
    ctx.strokeRect(
      x * cellSize + panOffset.x,
      y * cellSize + panOffset.y,
      cellSize,
      cellSize
    );
  }
}

function updateGrid(canvas, x, y) {
  if (grid[`${x},${y}`]) {
    grid[`${x},${y}`] = !grid[`${x},${y}`];
  } else {
    grid[`${x},${y}`] = true;
  }
  draw(canvas);
}

function nextGen() {
  const newGrid = {};
  for (let key in grid) {
    const [x, y] = key.split(",");
    const neighbors = countNeighbors(parseInt(x), parseInt(y));
    if (grid[key] && (neighbors === 2 || neighbors === 3)) {
      newGrid[key] = true;
    } else if (!grid[key] && neighbors === 3) {
      newGrid[key] = true;
    } else {
      newGrid[key] = false;
    }

    for (let i = parseInt(x) - 1; i <= parseInt(x) + 1; i++) {
      for (let j = parseInt(y) - 1; j <= parseInt(y) + 1; j++) {
        if (i === parseInt(x) && j === parseInt(y)) continue;
        if (grid[`${i},${j}`]) continue;
        const neighbors = countNeighbors(i, j);
        if (neighbors === 3) {
          newGrid[`${i},${j}`] = true;
        }
      }
    }
  }

  for (let key in newGrid) {
    grid[key] = newGrid[key];
  }
}

function countNeighbors(x, y) {
  let count = 0;
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (i === x && j === y) continue;
      if (grid[`${i},${j}`]) {
        count++;
      }
    }
  }
  return count;
}
