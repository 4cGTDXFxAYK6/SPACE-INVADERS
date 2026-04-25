const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 画面サイズ設定
canvas.width = 400;
canvas.height = 500;

let score = 0;
const player = { x: 180, y: 460, w: 40, h: 20, speed: 5 };
let bullets = [];
let invaders = [];
const invaderRows = 4;
const invaderCols = 7;

// インベーダー初期化
function initInvaders() {
    for (let r = 0; r < invaderRows; r++) {
        for (let c = 0; c < invaderCols; c++) {
            invaders.push({ x: c * 50 + 40, y: r * 40 + 50, w: 30, h: 20 });
        }
    }
}

let moveDir = 1;
let moveTimer = 0;

function update() {
    // インベーダー移動
    moveTimer++;
    if (moveTimer > 30) {
        let hitEdge = false;
        invaders.forEach(inv => {
            inv.x += 10 * moveDir;
            if (inv.x > canvas.width - 40 || inv.x < 10) hitEdge = true;
        });
        if (hitEdge) {
            moveDir *= -1;
            invaders.forEach(inv => inv.y += 20);
        }
        moveTimer = 0;
    }

    // 弾の移動と衝突判定
    bullets.forEach((b, bi) => {
        b.y -= 7;
        invaders.forEach((inv, ii) => {
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 自機
    ctx.fillStyle = '#0f0';
    ctx.fillRect(player.x, player.y, player.w, player.h);

    // インベーダー
    ctx.fillStyle = '#fff';
    invaders.forEach(inv => ctx.fillRect(inv.x, inv.y, inv.w, inv.h));

    // 弾
    ctx.fillStyle = '#ff0';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, 5, 10));

    if (invaders.length === 0) {
        ctx.fillStyle = '#fff';
        ctx.font = "30px Arial";
        ctx.fillText("CLEAR!", 150, 250);
    }
}

// 操作系
let leftPressed = false;
let rightPressed = false;

document.getElementById('leftBtn').ontouchstart = () => leftPressed = true;
document.getElementById('leftBtn').ontouchend = () => leftPressed = false;
document.getElementById('rightBtn').ontouchstart = () => rightPressed = true;
document.getElementById('rightBtn').ontouchend = () => rightPressed = false;
document.getElementById('fireBtn').ontouchstart = () => {
    if (bullets.length < 3) bullets.push({ x: player.x + 17, y: player.y });
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
