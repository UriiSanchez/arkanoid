import { loadSpritesheet, drawSprite } from '../assets/spritesheet.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const paddle = { x: canvas.width / 2 - 81, y: canvas.height - 40, width: 162, height: 14 };
const ball = { x: canvas.width / 2, y: paddle.y - 16, radius: 8, dx: 0, dy: 0, attachedToPaddle: true };

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.width, paddle.height);
  drawSprite(ctx, 'ball', ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
}

const PADDLE_SPEED = 7;
const keys = { left: false, right: false };

function clampPaddleX(x) {
  return Math.max(0, Math.min(canvas.width - paddle.width, x));
}

const BALL_SPEED = 5;
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60 grados

const bounceSound = new Audio('assets/sounds/ball-bounce.mp3');

function playBounceSound() {
  bounceSound.currentTime = 0;
  bounceSound.play();
}

function launchBall() {
  if (!ball.attachedToPaddle) return;
  ball.attachedToPaddle = false;
  ball.dx = 0;
  ball.dy = -BALL_SPEED;
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
  if (e.key === ' ') launchBall();
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
    ball.dx = BALL_SPEED * Math.sin(angle);
    ball.dy = -BALL_SPEED * Math.cos(angle);
    playBounceSound();
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loadSpritesheet(loop);
