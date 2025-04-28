const DEFAULT_DROP_SPEED = 300;
let dropSpeed = DEFAULT_DROP_SPEED;

const BLOCK_SIZE = 30;

const BOARD_ROW = 20;
const BOARD_COL = 10;

const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

const canvasW = BLOCK_SIZE * BOARD_COL;
const canvasH = BLOCK_SIZE * BOARD_ROW;
canvas.width = canvasW;
canvas.height = canvasH;

const container = document.getElementById("container");
container.style.width = canvasW + 'px';

const MINO_SIZE = 4;
const MINO_TYPES = [
    [],
    [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 1, 1],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
    ],
];

const MINO_COLORS = [
    '',
    '#f6fe85',
    '#07e0e7',
    '#7ced77',
    '#f78ff0',
    '#f94246',
    '#9693fe',
    '#f2b907',
];

let minoIdx
let mino

let offsetX = 0;
let offsetY = 0;

const board = [];

let timerId = NaN;


function draw() {
    /**
     * 画面の要素を描画する
     */
    // 背景の描画
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvasW, canvasH);


    for (let y = 0; y < BOARD_ROW; y++) {
        for (let x = 0; x < BOARD_COL; x++) {
            if (board[y][x]) {
                drawMino(x, y, board[y][x]);
            }
        }
    }

    for (let y = 0; y < MINO_SIZE; y++) {
        for (let x = 0; x < MINO_SIZE; x++) {
            if (mino[y][x]) {
                drawMino(offsetX + x, offsetY + y, minoIdx);
            }
        }
    }
}

function confirmMino() {
    /**
     * ミノの場所を確定させる
     */
    for (let y = 0; y < MINO_SIZE; y++) {
        for (let x = 0; x < MINO_SIZE; x++) {
            if (mino[y][x]) {
                board[offsetY + y][offsetX + x] = minoIdx;
            }
        }
    }
}

function drawMino(x, y, minoIdx) {
    let px = x * BLOCK_SIZE;
    let py = y * BLOCK_SIZE;

    ctx.fillStyle = MINO_COLORS[minoIdx];
    ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
    // ブロックの線を描画
    ctx.strokeStyle = "black";
    ctx.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}

function canMove(dx, dy, currentMino = mino) {
    for (let y = 0; y < MINO_SIZE; y++) {
        for (let x = 0; x < MINO_SIZE; x++) {
            if (currentMino[y][x]) {
                let nx = offsetX + x + dx;
                let ny = offsetY + y + dy;
                if (
                    ny < 0 ||
                    nx < 0 ||
                    ny >= BOARD_ROW ||
                    nx >= BOARD_COL ||
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
    /**
     * ミノを回転させる
     */
    let newMino = [];
    for (let y = 0; y < MINO_SIZE; y++) {
        newMino[y] = [];
        for (let x = 0; x < MINO_SIZE; x++) {
            newMino[y][x] = mino[MINO_SIZE - 1 - x][y];
        }
    }
    return newMino;
}

function dropMino() {
    /**
     * 可能な場合はミノを落下させる
     */
    if (canMove(0, 1)) {
        offsetY++;
    } else {
        confirmMino();
        // clearLine();
        minoIdx = randomMinoIdx();
        mino = MINO_TYPES[minoIdx];
        initStartPos();
    }
    draw();
}

function randomMinoIdx() {
    return Math.floor(Math.random() * (MINO_TYPES.length - 1) + 1);
}

function initStartPos() {
    /**
     * プレイヤーのミノの位置を初期化する
     */
    offsetX = BOARD_COL / 2 - MINO_SIZE / 2;
    offsetY = 0;
}

function init() {
    //ボード(20*10を0埋め)
    for (let y = 0; y < BOARD_ROW; y++) {
        board[y] = [];
        for (let x = 0; x < BOARD_COL; x++) {
            board[y][x] = 0;
        }
    }
    minoIdx = randomMinoIdx();
    mino = MINO_TYPES[minoIdx];

    initStartPos();
    timerId = setInterval(dropMino, dropSpeed);
    draw();
}

document.onkeydown = (e) => {
    // キー入力のマッピング
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
            break;
        case "ArrowDown":
            dropMino()
            break;
    }
    draw();
}
