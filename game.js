const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 画面サイズ設定 (少しだけ広げて、インベーダーを細かく)
canvas.width = 480;
canvas.height = 600;

let score = 0;
// 自機の色: 緑 (#0f0)
const player = { x: canvas.width / 2 - 20, y: 550, w: 40, h: 20, speed: 5, color: '#0f0' };
let bullets = [];
let invaders = [];
const invaderRows = 4;
const invaderCols = 10;
const invaderScale = 3; // ドットを拡大する倍率
const invaderWidth = 11 * invaderScale; // 形状データの幅 (11px * スケール)
const invaderHeight = 8 * invaderScale; // 形状データの高さ (8px * スケール)

// --- インベーダーの形状定義 (中型のタコ型) ---
// 1 = ドットあり, 0 = なし。11x8ピクセル
const invaderShapes = [
    // フレーム 1 (足が下)
    [
        [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0], //   o     o   
        [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], //    o   o    
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0], //   ooooooo   
        [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0], //  oo ooo oo  
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // ooooooooooo 
        [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1], // o o     o o 
        [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1], // o o     o o 
        [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0]  //    oo oo    
    ],
    // フレーム 2 (足が横)
    [
        [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0], // (same top)
        [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1], // o  o   o  o
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1], // o ooooooo o 
        [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1], // ooo ooo ooo 
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // ooooooooooo 
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], //  ooooooooo  
        [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0], //   o     o   
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]  //  o       o  
    ]
];

// --- カラー定義 (行ごと) ---
const invaderColors = [
    '#f0f', // 1段目: マゼンタ
    '#0f0', // 2段目: 緑
    '#0ff', // 3段目: シアン
    '#fff'  // 4段目: 白
];

// インベーダー初期化
function initInvaders() {
    invaders = [];
    for (let r = 0; r < invaderRows; r++) {
        for (let c = 0; c < invaderCols; c++) {
            invaders.push({
                x: c * (invaderWidth + 10) + 30, // 横間隔
                y: r * (invaderHeight + 15) + 60, // 縦間隔
                w: invaderWidth,
                h: invaderHeight,
                color: invaderColors[r] || '#fff', // 行ごとの色
                frame: 0 // アニメーションフレーム (0 か 1)
            });
        }
    }
}

let moveDir = 1;
let moveTimer = 0;
const moveSpeed = 40; // 数字が大きいほど遅い (オリジナルに近いゆったり感)

function update() {
    // インベーダー移動
    moveTimer++;
    if (moveTimer > moveSpeed) {
        let hitEdge = false;
        invaders.forEach(inv => {
            inv.x += 10 * moveDir;
            inv.frame = (inv.frame + 1) % invaderShapes.length; // フレーム切り替え (パタパタ)
            if (inv.x > canvas.width - inv.w - 10 || inv.x < 10) hitEdge = true;
        });

        if (hitEdge) {
            moveDir *= -1;
            invaders.forEach(inv => inv.y += 20);
            // ゲームオーバー判定: 自機の高さに到達
            if (invaders.some(inv => inv.y > player.y - inv.h)) {
                alert("GAME OVER! SCORE: " + score);
                initInvaders();
                score = 0;
                document.getElementById('score').innerText = `SCORE: ${score}`;
            }
        }
        moveTimer = 0;
    }

    // 弾の移動と衝突判定
    bullets.forEach((b, bi) => {
        b.y -= 7;
        invaders.forEach((inv, ii) => {
            // 当たり判定 (弾がインベーダーの矩形内にあるか)
            if (b.x < inv.x + inv.w && b.x + 5 > inv.x && b.y < inv.y + inv.h && b.y + 10 > inv.y) {
                invaders.splice(ii, 1);
                bullets.splice(bi, 1);
                score += 10;
                document.getElementById('score').innerText = `SCORE: ${score}`;
            }
        });
    });
    bullets = bullets.filter(b => b.y > 0);
}

// --- 【新規】単一のインベーダーを形状データに基づいて描画する関数 ---
function drawInvader(inv) {
    ctx.fillStyle = inv.color;
    const shape = invaderShapes[inv.frame];
    
    // 行
    for (let i = 0; i < shape.length; i++) {
        // 列
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] === 1) {
                // ドットを矩形で描画 (スケールを考慮して拡大)
                ctx.fillRect(
                    inv.x + j * invaderScale,
                    inv.y + i * invaderScale,
                    invaderScale,
                    invaderScale
                );
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 自機: 緑
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // インベーダー (専用のドット絵関数で描画)
    invaders.forEach(inv => drawInvader(inv));

    // 弾: 黄色 (#ff0)
    ctx.fillStyle = '#ff0';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 5, 10));

    // クリア判定
    if (invaders.length === 0 && score > 0) {
        ctx.fillStyle = '#fff';
        ctx.font = "40px 'Courier New'";
        ctx.textAlign = "center";
        ctx.fillText("STAGE CLEAR!", canvas.width / 2, canvas.height / 2);
    }
}

// 操作系 (変更なし。e.preventDefault()を追加してタッチ時のスクロール防止)
let leftPressed = false;
let rightPressed = false;

document.getElementById('leftBtn').ontouchstart = (e) => { e.preventDefault(); leftPressed = true; };
document.getElementById('leftBtn').ontouchend = () => leftPressed = false;
document.getElementById('rightBtn').ontouchstart = (e) => { e.preventDefault(); rightPressed = true; };
document.getElementById('rightBtn').ontouchend = () => rightPressed = false;
document.getElementById('fireBtn').ontouchstart = (e) => {
    e.preventDefault();
    if (bullets.length < 3) bullets.push({ x: player.x + player.w / 2 - 2, y: player.y });
};

function loop() {
    if (leftPressed && player.x > 0) player.x -= player.speed;
    if (rightPressed && player.x < canvas.width - player.w) player.x += player.speed;
    update();
    draw();
    requestAnimationFrame(loop);
}

initInvaders();
loop();
