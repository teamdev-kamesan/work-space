const speed = 300;

const blockSize = 30;

const boardRow = 20;
const boardCol = 10;

const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

const canvasW = blockSize * boardCol;
const canvasH = blockSize * boardRow;
canvas.width = canvasW;
canvas.height = canvasH;

const container = document.getElementById("container");
container.style.width = canvasW + 'px';

const minoSize = 4;

let mino = [
    [0, 0, 0, 0],
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
]

let offsetX = 0;
let offsetY = 0;

const board = [];

let timerId = NaN;

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvasW, canvasH);

    ctx.fillStyle = "#f00";

    for (let y = 0; y < boardRow; y++) {
        for (let x = 0; x < boardCol; x++) {
            if (board[y][x]) {
                drawMino(x, y);
            }
        }
    }

    for (let y = 0; y < minoSize; y++) {
        for (let x = 0; x < minoSize; x++) {
            if (mino[y][x]) {
                drawMino(offsetX + x, offsetY + y);
            }
        }
    }
}

function drawMino(x, y) {
    let px = x * blockSize;
    let py = y * blockSize;

    ctx.fillStyle = "f00";
    ctx.fillRect(px, py, blockSize, blockSize);

    ctx.strokeStyle = "black";
    ctx.strokeRect(px, py, blockSize, blockSize);
}

function canMove(dx, dy, currentMino = mino) {
    for (let y = 0; y < minoSize; y++) {
        for (let x = 0; x < minoSize; x++) {
            if (currentMino[y][x]) {
                let nx = offsetX + x + dx;
                let ny = offsetY + y + dy;
                if (
                    ny < 0 ||
                    nx < 0 ||
                    ny >= boardRow ||
                    nx >= boardCol ||
                    board[ny][nx]
                ) {
                    return false
                }

            }
        }
    }
    return true
}

function createRotateMino() {
    let newMino = [];
    for (let y = 0; y < minoSize; y++) {
        newMino[y] = [];
        for (let x = 0; x < minoSize; x++) {
            newMino[y][x] = mino[minoSize - 1 - x][y];
        }
    }
    return newMino;
}

function dropMino() {
    if (canMove(0, 1)) {
        offsetY++;
    } else {
    }
    draw();
}

function initStartPos() {
    offsetX = boardCol / 2 - minoSize / 2;
    offsetY = 0;
}

function init() {
    //ボード(20*10を0埋め)
    for (let y = 0; y < boardRow; y++) {
        board[y] = [];
        for (let x = 0; x < boardCol; x++) {
            board[y][x] = 0;
        }
    }
    //テスト用
    // board[3][5] = 1;
    initStartPos();
    timerId = setInterval(dropMino, speed);
    draw();
}

document.onkeydown = (e) => {
    switch (e.code) {
        case "ArrowLeft":
            if (canMove(-1, 0)) offsetX--;
            break;
        case "ArrowRight":
            if (canMove(1, 0)) offsetX++;
            break;
        case "ArrowUp":
            let newMino = createRotateMino();
            if (canMove(0, 0, newMino)) {
                mino = newMino;
            }

    }
    draw();
}
