const DEFAULT_DROP_SPEED = 300;
let dropSpeed = DEFAULT_DROP_SPEED;

const BLOCK_SIZE = 30;

const BOARD_ROW = 20;
const BOARD_COL = 10;

let SCORE = 0;

const GAME_STATES = Object.freeze({
    beforeStart: "beforeStart",
    playing: "playing",
    gameOver: "gameover"
})

let gameState = GAME_STATES.beforeStart

const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");

const canvasW = BLOCK_SIZE * BOARD_COL;
const canvasH = BLOCK_SIZE * BOARD_ROW;
canvas.width = canvasW;
canvas.height = canvasH;

let nextMinoIdx;
let nextMino;
const nextCanvas = document.getElementById("nextCanvas");
const nextCtx = nextCanvas.getContext("2d");

let holdMinoIdx = 0;
let holdMino = null;
let isHoldUsed = false;
let hasHoldedThisTurn = false;

const holdCanvas = document.getElementById("holdCanvas");
const holdCtx = holdCanvas.getContext("2d");

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
    '#f1f000',
    '#a100f0',
    '#f00001',
    '#01f001',
    '#00f0f1',
    '#0100f1',
    '#f0a001',
];

const HIGHT_COLOR = [
    '',
    '#fbf996',
    '#e4b9fb',
    '#fab3af',
    '#b8f9b7',
    '#b4fbfa',
    '#b4b7fe',
    '#fce5b6',
]

const SHADE_COLOR1 = [
    '',
    '#797703',
    '#5d1383',
    '#760003',
    '#128312',
    '#00787a',
    '#000176',
    '#795001',
]

const SHADE_COLOR2 = [
    '',
    '#d8d800',
    '#8f00d8',
    '#d80001',
    '#01d801',
    '#01d7d9',
    '#0100da',
    '#d89000',
]


let minoIdx
let mino

let offsetX = 0;
let offsetY = 0;

const board = [];

let timerId = NaN;

document.addEventListener("keydown", function (event) {
    if (event.code === "Space" || event.key === " ") {
        if (document.activeElement.tagName === "BUTTON") {
            event.preventDefault(); // スペースによるボタンの押下を防ぐ
        }
    }
});



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
                drawMino(x, y, board[y][x], ctx);
            }
        }
    }

    const ghostY = ghostPosY();
    drawGhostMino(offsetX, ghostY, minoIdx)
    for (let y = 0; y < MINO_SIZE; y++) {
        for (let x = 0; x < MINO_SIZE; x++) {
            if (mino[y][x]) {
                drawMino(offsetX + x, offsetY + y, minoIdx, ctx);
            }
        }
    }

    //ゲームオーバーの処理
    if (gameState === GAME_STATES.gameOver) {
        const s = "GAME OVER";
        ctx.font = "30px 'Press Start 2P'";
        const w = ctx.measureText(s).width;
        const x = canvasW / 2 - w / 2;
        const y = canvasH / 2 - 20;
        ctx.fillStyle = 'white';
        ctx.fillText(s, x, y);
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

function drawMino(x, y, minoIdx, ctx) {
    let px = x * BLOCK_SIZE;
    let py = y * BLOCK_SIZE;
    let s = BLOCK_SIZE;
    let offset = s / 5; // 三角形の幅

    // ベースカラー
    ctx.fillStyle = MINO_COLORS[minoIdx];
    ctx.fillRect(px, py, s, s);

    // 上側ハイライト
    ctx.fillStyle = HIGHT_COLOR[minoIdx];
    ctx.fillRect(px, py, s, offset);

    // 左側シャドウ
    ctx.fillStyle = SHADE_COLOR2[minoIdx];
    ctx.fillRect(px, py, offset, s);

    // 右側シャドウ
    ctx.fillStyle = SHADE_COLOR2[minoIdx];
    ctx.fillRect(px + s - offset, py, offset, s);

    // 下側シャドウ
    ctx.fillStyle = SHADE_COLOR1[minoIdx];
    ctx.fillRect(px, py + s - offset, s, offset);

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + offset, py);
    ctx.lineTo(px + offset, py + offset);
    ctx.closePath();
    ctx.fillStyle = HIGHT_COLOR[minoIdx];
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px + s - offset, py);
    ctx.lineTo(px + s, py);
    ctx.lineTo(px + s - offset, py + offset);
    ctx.closePath();
    ctx.fillStyle = HIGHT_COLOR[minoIdx];
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px, py + s - offset);
    ctx.lineTo(px + offset, py + s - offset);
    ctx.lineTo(px, py + s);
    ctx.closePath();
    ctx.fillStyle = SHADE_COLOR2[minoIdx];
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px + s, py + s - offset);
    ctx.lineTo(px + s, py + s);
    ctx.lineTo(px + s - offset, py + s - offset);
    ctx.closePath();
    ctx.fillStyle = SHADE_COLOR2[minoIdx];
    ctx.fill();

    // ブロックの線を描画
    ctx.strokeStyle = "black";
    ctx.strokeRect(px, py, s, s);
}

function drawGhostMino(x, y, minoIdx) {
    const ghostColor = "rgba(200,200,200,0.4)";
    for (let y2 = 0; y2 < MINO_SIZE; y2++) {
        for (let x2 = 0; x2 < MINO_SIZE; x2++) {
            if (mino[y2][x2]) {
                ctx.fillStyle = ghostColor;
                ctx.fillRect((x + x2) * BLOCK_SIZE, (y + y2) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function ghostPosY() {
    let ghostY = offsetY;
    while (canMove(0, 1, mino, offsetX, ghostY)) {
        ghostY++;
    }
    return ghostY;
}

function canMove(dx, dy, currentMino = mino, baseX = offsetX, baseY = offsetY) {
    /**
     * 指定された方向に移動できるかどうかを返す
     */
    for (let y = 0; y < MINO_SIZE; y++) {
        for (let x = 0; x < MINO_SIZE; x++) {
            if (currentMino[y][x]) {
                let nx = baseX + x + dx;
                let ny = baseY + y + dy;
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

let clearLineCount = 0;

function clearLine() {
    for (let y = 0; y < BOARD_ROW; y++) {
        let isLineOK = true;
        for (let x = 0; x < BOARD_COL; x++) {
            if (board[y][x] === 0) {
                isLineOK = false;
                break;
            }
        }
        if (isLineOK) {
            for (let ny = y; ny > 0; ny--) {
                for (let nx = 0; nx < BOARD_COL; nx++) {
                    board[ny][nx] = board[ny - 1][nx];
                }
            }

            clearLineCount += 1;
        }
    }

    if (clearLineCount === 1) {
        addScore(100);
        clearLineCount = 0;

    } else if (clearLineCount === 2) {
        addScore(300);
        clearLineCount = 0;

    } else if (clearLineCount === 3) {
        addScore(500);
        clearLineCount = 0;

    } else if (clearLineCount === 4) {
        addScore(800);
        clearLineCount = 0;

    }

}

function destroyAllMino() {
    /**
     * 全てのミノを削除
     */
    for (let y = 0; y < BOARD_ROW; y++) {

        for (let ny = y; ny > 0; ny--) {
            for (let nx = 0; nx < BOARD_COL; nx++) {
                board[ny][nx] = board[ny - 1][nx];
            }
        }
    }

    clearScore();

}

function clearScore() {
    SCORE = 0;
    updateScore();
}

function updateScore() {
    /**
     * スコア更新
     */
    document.getElementById("scoreLabel").textContent = "SCORE : " + SCORE;
}

function addScore(amount) {
    /**
     * スコア加算
     */
    SCORE += amount;
    updateScore();
}


function dropMino() {
    /**
     * 可能な場合はミノを落下させる
     * 置けたかどうかのboolを返す
     */
    let hasMoved = true
    if (canMove(0, 1)) {
        offsetY++;
    } else {
        hasMoved = false
        hasHoldedThisTurn = false
        confirmMino();
        clearLine();
        minoIdx = nextMinoIdx;
        mino = nextMino;
        nextMinoIdx = bag.popFromBag();
        nextMino = MINO_TYPES[nextMinoIdx];
        drawNext();
        initStartPos();
        if (!canMove(0, 0)) {
            gameState = GAME_STATES.gameOver;
            clearInterval(timerId);
        }
    }
    draw();
    isHoldUsed = false;
    return hasMoved
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
    draw();
}

function gameStart() {
    if (gameState === GAME_STATES.playing) return

    destroyAllMino();

    bag = new Bag()
    minoIdx = bag.popFromBag();
    mino = MINO_TYPES[minoIdx];
    nextMinoIdx = bag.popFromBag();
    nextMino = MINO_TYPES[nextMinoIdx];

    initStartPos();
    timerId = setInterval(dropMino, dropSpeed);
    draw();
    drawNext();
    gameState = GAME_STATES.playing
}

function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    for (let y = 0; y < MINO_SIZE; y++) {
        for (let x = 0; x < MINO_SIZE; x++) {
            if (nextMino[y][x]) {
                drawMino(x, y, nextMinoIdx, nextCtx);
            }
        }
    }
}


function doHold() {
    if (hasHoldedThisTurn) return
    if (holdMinoIdx === 0) {
        holdMinoIdx = minoIdx;
        holdMino = MINO_TYPES[holdMinoIdx];
        minoIdx = nextMinoIdx;
        mino = MINO_TYPES[minoIdx];
        nextMinoIdx = bag.popFromBag();
        nextMino = MINO_TYPES[nextMinoIdx];
    } else {
        let tempIdx = minoIdx;
        minoIdx = holdMinoIdx;
        mino = MINO_TYPES[minoIdx];
        holdMinoIdx = tempIdx;
        holdMino = MINO_TYPES[holdMinoIdx];
    }
    hasHoldedThisTurn = true;
    initStartPos();
}

function drawHold() {
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (!holdMino) return;

    for (let y = 0; y < MINO_SIZE; y++) {
        for (let x = 0; x < MINO_SIZE; x++) {
            if (holdMino[y][x]) {
                drawMino(x, y, holdMinoIdx, holdCtx);
            }
        }
    }
}

document.onkeydown = (e) => {
    if (gameState === GAME_STATES.gameOver) return;
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
        case "Space":
            // ハードドロップ
            while (dropMino()) { }
            break;
        case "KeyC":
            // CキーでHOLD
            if (!isHoldUsed) {
                doHold();
                isHoldUsed = true;
                draw();
                drawHold();
            }
            break;
    }
    draw();
}

class Bag {
    minoIdxs = []
    constructor() {
        this.createBag()
    }
    createBag() {
        /**
         * 一意のミノのインデックス一覧をランダムに並び替えたものを返す
         */
        const res = [1, 2, 3, 4, 5, 6, 7]
        for (let i = res.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [res[i], res[j]] = [res[j], res[i]];
        }
        this.minoIdxs = res
    }
    popFromBag() {
        if (this.minoIdxs.length <= 0) this.createBag()
        return this.minoIdxs.pop()
    }
}
