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

loadSpritesheet(draw);
