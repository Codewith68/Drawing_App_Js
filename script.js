const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const pencilButton = document.getElementById("pencilButton");
const eraserButton = document.getElementById("eraserButton");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const clearButton = document.getElementById("clearButton");
const colorPicker = document.getElementById("colorPicker");
const brushSizeInput = document.getElementById("brushSize");
const brushSizeValue = document.getElementById("brushSizeValue");

let paths = [];
let redoStack = [];
let isDrawing = false;
let currentPath = null;
let currentTool = "pencil";
let currentColor = colorPicker.value;
let brushSize = Number(brushSizeInput.value);
const canvasBackgroundColor = () => getComputedStyle(canvas).backgroundColor;

function updateToolUi() {
    pencilButton.classList.toggle("active", currentTool === "pencil");
    eraserButton.classList.toggle("active", currentTool === "eraser");
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redrawAll();
}
function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
}

function drawPath(path) {
    if (!path.points.length) {
        return;
    }
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = path.size;
    ctx.strokeStyle = path.tool === "eraser" ? canvasBackgroundColor() : path.color;

    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);

    for (let i = 1; i < path.points.length; i += 1) {
        const point = path.points[i];
        ctx.lineTo(point.x, point.y);
    }

    if (path.points.length === 1) {
        const p = path.points[0];
        ctx.arc(p.x, p.y, path.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = path.tool === "eraser" ? canvasBackgroundColor() : path.color;
        ctx.fill();
    }

    ctx.stroke();
    ctx.restore();
}

function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach(drawPath);
}

function startDrawing(event) {
    isDrawing = true;
    const point = getPoint(event);

    currentPath = {
        tool: currentTool,
        color: currentColor,
        size: brushSize,
        points: [point],
    };

    paths.push(currentPath);
    redoStack = [];
    redrawAll();
}

function draw(event) {
    if (!isDrawing || !currentPath) {
        return;
    }

    currentPath.points.push(getPoint(event));
    redrawAll();
}

function stopDrawing() {
    if (!isDrawing) {
        return;
    }

    isDrawing = false;
    currentPath = null;
}

function undo() {
    if (!paths.length) {
        return;
    }

    redoStack.push(paths.pop());
    redrawAll();
}

function redo() {
    if (!redoStack.length) {
        return;
    }

    paths.push(redoStack.pop());
    redrawAll();
}

function clearCanvas() {
    paths = [];
    redoStack = [];
    redrawAll();
}

pencilButton.addEventListener("click", () => {
    currentTool = "pencil";
    updateToolUi();
});

eraserButton.addEventListener("click", () => {
    currentTool = "eraser";
    updateToolUi();
});

colorPicker.addEventListener("input", (event) => {
    currentColor = event.target.value;
});

brushSizeInput.addEventListener("input", (event) => {
    brushSize = Number(event.target.value);
    brushSizeValue.textContent = String(brushSize);
});

undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);
clearButton.addEventListener("click", clearCanvas);

canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    startDrawing(event);
});

canvas.addEventListener("pointermove", draw);
canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointerleave", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);

window.addEventListener("resize", resizeCanvas);

updateToolUi();
brushSizeValue.textContent = String(brushSize);
resizeCanvas();
