const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const playBtn = document.getElementById('playBtn');
    const resetBtn = document.getElementById('resetBtn');
    const debugText = document.getElementById('debugText');
    const speedSlider = document.getElementById('speedSlider');

    // Game of Life variables
    const cellSize = 20; // Size of each cell
    const minScale = 0.5; // Minimum scale factor
    const maxScale = 2; // Maximum scale factor
    let scale = 1; // Initial scale factor
    let grid = createEmptyGrid(); // Initial grid
    let isPlaying = false;
    let simulationSpeed = 500; // Initial simulation speed (in milliseconds)
    let offsetX = 0; // Offset for panning
    let offsetY = 0; // Offset for panning

    // Create an empty grid
    function createEmptyGrid() {
      const grid = {};
      return grid;
    }

    // Draw the grid on the canvas
    function drawGrid() {
      const rect = canvas.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height; 
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const startX = Math.floor(-offsetX / (cellSize * scale));
      const startY = Math.floor(-offsetY / (cellSize * scale));
      const endX = Math.ceil((canvasWidth - offsetX) / (cellSize * scale));
      const endY = Math.ceil((canvasHeight - offsetY) / (cellSize * scale));

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const screenX = (x * cellSize * scale) + offsetX;
          const screenY = (y * cellSize * scale) + offsetY;
          const isAlive = grid[[x, y]] || false;

          if (isAlive) {
            ctx.fillRect(screenX, screenY, cellSize * scale, cellSize * scale);
          } else {
            ctx.strokeRect(screenX, screenY, cellSize * scale, cellSize * scale);
          }
        }
      }
    }

    // Handle canvas click events
    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left - offsetX) / (cellSize * scale));
      const y = Math.floor((event.clientY - rect.top - offsetY) / (cellSize * scale));
      grid[[x, y]] = !grid[[x, y]]; // Toggle cell state
      drawGrid();
    });

    // Handle play/pause button click
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        playBtn.innerHTML = "Pause";
        startGame();
      }
      else {
	playBtn.innerHTML = "Play";
      }
    });

    // Handle reset button click
    resetBtn.addEventListener('click', () => {
      grid = createEmptyGrid();
      drawGrid();
      isPlaying = false;
      playBtn.innerHTML = "Play";
    });

    // Handle speed slider change
    speedSlider.addEventListener('input', () => {
      simulationSpeed = parseInt(speedSlider.value);
    });

    // Handle mouse wheel event for zooming
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const delta = Math.sign(event.deltaY);
      const newScale = Math.max(minScale, Math.min(maxScale, scale + delta * 0.1));

      if (newScale !== scale) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const offsetXRatio = mouseX / (rect.width * scale);
        const offsetYRatio = mouseY / (rect.height * scale);

        scale = newScale;
        offsetX = mouseX - offsetXRatio * rect.width * scale;
        offsetY = mouseY - offsetYRatio * rect.height * scale;
        drawGrid();
      }
    });

    // Handle mouse move event for panning
    canvas.addEventListener('mousemove', (event) => {
      if (event.buttons === 1) { // Check if left mouse button is down
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const dx = event.movementX;
        const dy = event.movementY;

        offsetX += dx;
        offsetY += dy;
        drawGrid();
      }
    });

    // Game loop
    function startGame() {
      if (!isPlaying) return;
      const nextGrid = { ...grid }; // Create a copy of the grid
      for (const [key, isAlive] of Object.entries(grid)) {
        const [x, y] = key.split(',').map(Number);
        const neighbors = countNeighbors(x, y);
        if (isAlive && (neighbors === 2 || neighbors === 3)) {
          nextGrid[[x, y]] = true; // Live cell with 2 or 3 neighbors survives
        } else if (!isAlive && neighbors === 3) {
          nextGrid[[x, y]] = true; // Dead cell with 3 neighbors becomes alive
        } else {
          nextGrid[[x, y]] = false;
        }
      }
      grid = nextGrid;
      drawGrid();
      setTimeout(startGame, simulationSpeed);
    }

    // Count the number of live neighbors for a given cell
    function countNeighbors(x, y) {
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue; // Skip the current cell
          const nx = x + dx;
          const ny = y + dy;
          if (grid[[nx, ny]]) count++;
        }
      }
      return count;
    }

    // Handle window resize
    function updateCanvasSize() {
      const rect = canvas.getBoundingClientRect();
	debugText.innerHTML = "Canvas Width: " + canvas.width + "<br> Canvas Height: " + rect.width;
      const container = canvas.parentElement;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      canvas.width = containerWidth * 0.9;
      canvas.height = containerHeight * 0.9;
      drawGrid();
    }

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize(); // Set initial canvas size