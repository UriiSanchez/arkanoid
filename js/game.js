const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const paddle = { x: canvas.width / 2 - 81, y: canvas.height - 40, width: 162, height: 14 };
const ball = { x: canvas.width / 2, y: paddle.y - 16, radius: 8, dx: 0, dy: 0, attachedToPaddle: true };

const BLOCK_COLS = 10;
const BLOCK_WIDTH = 64;
const BLOCK_HEIGHT = 24;
const BLOCK_PADDING = 4;
const BLOCK_OFFSET_TOP = 50;
const BLOCK_OFFSET_LEFT = (canvas.width - (BLOCK_COLS * (BLOCK_WIDTH + BLOCK_PADDING) - BLOCK_PADDING)) / 2;

const MAX_LEVEL = 5;
const BASE_ROWS = 4;
const MAX_ROWS = 8;
const LEVEL_TRANSITION_DURATION = 1500;
const BLOCK_COLORS = ['gray', 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green'];

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

let score = 0;
let lives = 3;
let level = 1;
let gameState = 'start';

const overlayStart = document.getElementById('overlay-start');
const overlayPause = document.getElementById('overlay-pause');
const overlayGameover = document.getElementById('overlay-gameover');
const overlayWin = document.getElementById('overlay-win');
const overlayLevelup = document.getElementById('overlay-levelup');
const gameoverScoreEl = document.getElementById('gameover-score');
const winScoreEl = document.getElementById('win-score');
const levelupMessageEl = document.getElementById('levelup-message');
const btnStart = document.getElementById('btn-start');
const btnRestartGameover = document.getElementById('btn-restart-gameover');
const btnRestartWin = document.getElementById('btn-restart-win');
const btnSoundToggle = document.getElementById('btn-sound-toggle');

const SOUND_STORAGE_KEY = 'arkanoid:soundEnabled';

function loadSoundEnabled() {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) !== 'false';
  } catch (e) {
    return true;
  }
}

function saveSoundEnabled(value) {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, String(value));
  } catch (e) {
    // localStorage no disponible (p.ej. modo privado); se mantiene solo en memoria.
  }
}

let soundEnabled = loadSoundEnabled();

function updateSoundButton() {
  btnSoundToggle.textContent = soundEnabled ? '🔊' : '🔇';
}

updateSoundButton();

btnSoundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  saveSoundEnabled(soundEnabled);
  updateSoundButton();
});

function setGameState(state) {
  gameState = state;
  overlayStart.classList.toggle('hidden', state !== 'start');
  overlayPause.classList.toggle('hidden', state !== 'paused');
  overlayGameover.classList.toggle('hidden', state !== 'gameover');
  overlayWin.classList.toggle('hidden', state !== 'win');
  overlayLevelup.classList.toggle('hidden', state !== 'levelup');

  if (state === 'gameover') gameoverScoreEl.textContent = `Puntuación final: ${score}`;
  if (state === 'win') winScoreEl.textContent = `Puntuación final: ${score}`;

  if (state === 'levelup') {
    setTimeout(() => {
      if (gameState === 'levelup') setGameState('playing');
    }, LEVEL_TRANSITION_DURATION);
  }
}

function createBlocks(level) {
  const rows = Math.min(BASE_ROWS + (level - 1), MAX_ROWS);
  let rowColors = [];
  while (rowColors.length < rows) rowColors = rowColors.concat(shuffle(BLOCK_COLORS));
  rowColors = rowColors.slice(0, rows);

  const blocks = [];
  for (let row = 0; row < rows; row++) {
    const color = rowColors[row];
    const points = (rows - row) * 10;
    for (let col = 0; col < BLOCK_COLS; col++) {
      blocks.push({
        x: BLOCK_OFFSET_LEFT + col * (BLOCK_WIDTH + BLOCK_PADDING),
        y: BLOCK_OFFSET_TOP + row * (BLOCK_HEIGHT + BLOCK_PADDING),
        width: BLOCK_WIDTH,
        height: BLOCK_HEIGHT,
        color,
        points,
        alive: true,
      });
    }
  }
  return blocks;
}

let blocks = createBlocks(level);
let explosions = [];

function spawnExplosion(block) {
  explosions.push({
    x: block.x,
    y: block.y,
    width: block.width,
    height: block.height,
    color: block.color,
    startTime: performance.now(),
  });
}

function drawExplosions() {
  const now = performance.now();
  explosions = explosions.filter((explosion) => {
    const elapsed = now - explosion.startTime;
    if (elapsed >= EXPLOSION_DURATION) return false;

    const frames = EXPLOSION_FRAMES[explosion.color];
    const frameDuration = EXPLOSION_DURATION / frames.length;
    const frameIndex = Math.min(frames.length - 1, Math.floor(elapsed / frameDuration));
    drawFrame(ctx, frames[frameIndex], explosion.x, explosion.y, explosion.width, explosion.height);
    return true;
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const block of blocks) {
    if (block.alive) drawSprite(ctx, `block_${block.color}`, block.x, block.y, block.width, block.height);
  }
  drawExplosions();
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.width, paddle.height);
  drawSprite(ctx, 'ball', ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
  ctx.fillStyle = '#fff';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Puntuación: ${score}`, 10, 20);
  ctx.fillText(`Nivel: ${level}`, canvas.width / 2 - 30, 20);
  ctx.fillText(`Vidas: ${lives}`, canvas.width - 80, 20);
}

const PADDLE_SPEED = 7;
const keys = { left: false, right: false };

function clampPaddleX(x) {
  return Math.max(0, Math.min(canvas.width - paddle.width, x));
}

const BASE_BALL_SPEED = 5;
const BALL_SPEED_INCREMENT = 0.7;
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60 grados

function getBallSpeedForLevel(lvl) {
  return BASE_BALL_SPEED + (lvl - 1) * BALL_SPEED_INCREMENT;
}

const bounceSound = new Audio('assets/sounds/ball-bounce.mp3');
const breakSound = new Audio('assets/sounds/break-sound.mp3');

function playBounceSound() {
  if (!soundEnabled) return;
  bounceSound.currentTime = 0;
  bounceSound.play();
}

function playBreakSound() {
  if (!soundEnabled) return;
  breakSound.currentTime = 0;
  breakSound.play();
}

function launchBall() {
  if (gameState !== 'playing' || !ball.attachedToPaddle) return;
  ball.attachedToPaddle = false;
  ball.dx = 0;
  ball.dy = -getBallSpeedForLevel(level);
}

function resetBallAndPaddle() {
  paddle.x = canvas.width / 2 - paddle.width / 2;
  ball.dx = 0;
  ball.dy = 0;
  ball.attachedToPaddle = true;
}

function loseLife() {
  lives -= 1;
  resetBallAndPaddle();
  if (lives <= 0) {
    setGameState('gameover');
  }
}

function togglePause() {
  if (gameState === 'playing') setGameState('paused');
  else if (gameState === 'paused') setGameState('playing');
}

function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  blocks = createBlocks(level);
  resetBallAndPaddle();
  setGameState('playing');
}

btnStart.addEventListener('click', () => setGameState('playing'));
btnRestartGameover.addEventListener('click', resetGame);
btnRestartWin.addEventListener('click', resetGame);

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
  if (e.key === ' ') launchBall();
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
  paddle.x = clampPaddleX(mouseX - paddle.width / 2);
});

canvas.addEventListener('click', launchBall);

function update() {
  if (gameState !== 'playing') return;

  if (keys.left) paddle.x = clampPaddleX(paddle.x - PADDLE_SPEED);
  if (keys.right) paddle.x = clampPaddleX(paddle.x + PADDLE_SPEED);

  if (ball.attachedToPaddle) {
    ball.x = paddle.x + paddle.width / 2;
    return;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.dx = -ball.dx;
    playBounceSound();
  } else if (ball.x + ball.radius > canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.dx = -ball.dx;
    playBounceSound();
  }

  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.dy = -ball.dy;
    playBounceSound();
  }

  if (
    ball.dy > 0 &&
    ball.y + ball.radius >= paddle.y &&
    ball.y + ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width
  ) {
    ball.y = paddle.y - ball.radius;
    const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
    const clampedHitPos = Math.max(-1, Math.min(1, hitPos));
    const angle = clampedHitPos * MAX_BOUNCE_ANGLE;
    const speed = getBallSpeedForLevel(level);
    ball.dx = speed * Math.sin(angle);
    ball.dy = -speed * Math.cos(angle);
    playBounceSound();
  }

  checkBlockCollision();

  if (ball.y - ball.radius > canvas.height) {
    loseLife();
  }
}

function checkBlockCollision() {
  for (const block of blocks) {
    if (!block.alive) continue;

    const isColliding =
      ball.x + ball.radius > block.x &&
      ball.x - ball.radius < block.x + block.width &&
      ball.y + ball.radius > block.y &&
      ball.y - ball.radius < block.y + block.height;

    if (!isColliding) continue;

    block.alive = false;
    score += block.points;
    playBreakSound();
    spawnExplosion(block);

    const overlapLeft = ball.x + ball.radius - block.x;
    const overlapRight = block.x + block.width - (ball.x - ball.radius);
    const overlapTop = ball.y + ball.radius - block.y;
    const overlapBottom = block.y + block.height - (ball.y - ball.radius);
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapLeft || minOverlap === overlapRight) {
      ball.dx = -ball.dx;
    } else {
      ball.dy = -ball.dy;
    }

    if (blocks.every((b) => !b.alive)) {
      if (level < MAX_LEVEL) {
        levelupMessageEl.textContent = `Nivel ${level} superado`;
        level += 1;
        blocks = createBlocks(level);
        resetBallAndPaddle();
        setGameState('levelup');
      } else {
        setGameState('win');
      }
    }

    break;
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadSpritesheet(loop);
