const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const levelDisplay = document.getElementById("level-display");
const bloodDisplay = document.getElementById("blood-display");
const alertDisplay = document.getElementById("alert-display");
const bloodBar = document.getElementById("blood-bar");
const alertBar = document.getElementById("alert-bar");
const skillBtn = document.getElementById("skill-btn");

const overlay = document.getElementById("message-overlay");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const startBtn = document.getElementById("start-btn");

let currentLevelIndex = 1;
let currentLevel = null;
let gameRunning = false;
let timer = 0;

let mosquito = {
  x: 180,
  y: 500,
  targetX: 180,
  targetY: 500,
  size: 14,
  isBiting: false
};

let gameState = {
  blood: 0,
  alert: 0
};

// 關卡清單
const levels = {
  1: window.Level1,
  2: window.Level2,
  3: window.Level3
};

function initLevel(lvlNum) {
  currentLevel = levels[lvlNum];
  levelDisplay.textContent = currentLevel.id;
  skillBtn.textContent = currentLevel.skillName;

  gameState.blood = 0;
  gameState.alert = 0;
  mosquito.x = canvas.width / 2;
  mosquito.y = canvas.height - 80;
  mosquito.targetX = mosquito.x;
  mosquito.targetY = mosquito.y;
  mosquito.isBiting = false;

  updateUI();

  modalTitle.textContent = currentLevel.title;
  modalDesc.textContent = currentLevel.story;
  startBtn.textContent = "開始吸血";
  overlay.style.display = "flex";
  gameRunning = false;
}

startBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  gameRunning = true;
});

// 手指觸控或滑鼠拖曳操控
function updatePosition(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  mosquito.targetX = (clientX - rect.left) * scaleX;
  mosquito.targetY = (clientY - rect.top) * scaleY;
}

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!gameRunning) return;
  const touch = e.touches[0];
  updatePosition(touch.clientX, touch.clientY);
}, { passive: false });

canvas.addEventListener("touchstart", (e) => {
  if (!gameRunning) return;
  const touch = e.touches[0];
  updatePosition(touch.clientX, touch.clientY);
});

canvas.addEventListener("mousemove", (e) => {
  if (!gameRunning) return;
  updatePosition(e.clientX, e.clientY);
});

function updateUI() {
  bloodDisplay.textContent = Math.floor(gameState.blood) + "%";
  alertDisplay.textContent = Math.floor(gameState.alert) + "%";
  bloodBar.style.width = Math.min(gameState.blood, 100) + "%";
  alertBar.style.width = Math.min(gameState.alert, 100) + "%";
}

function checkBite() {
  const zones = currentLevel.getBiteZones(canvas.width, canvas.height);
  mosquito.isBiting = false;

  for (let zone of zones) {
    const dist = Math.hypot(mosquito.x - zone.x, mosquito.y - zone.y);
    if (dist < zone.radius) {
      mosquito.isBiting = true;
      gameState.blood += zone.bloodRate;
      gameState.alert += zone.alertRate;
      break;
    }
  }

  // 沒停在吸血區時警戒值會緩慢回降
  if (!mosquito.isBiting && gameState.alert > 0) {
    gameState.alert -= 0.15;
    if (gameState.alert < 0) gameState.alert = 0;
  }
}

function drawMosquito() {
  ctx.save();
  ctx.translate(mosquito.x, mosquito.y);

  // 蚊子本體 (忍者黑)
  ctx.fillStyle = mosquito.isBiting ? "#c0392b" : "#111";
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // 蚊子翅膀 (拍動效果)
  const wingFlap = Math.sin(timer * 0.8) * 8;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(-12, -8 + wingFlap);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(12, -8 - wingFlap);
  ctx.stroke();

  // 口器 (吸血針)
  ctx.strokeStyle = "#7f8c8d";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(0, -16);
  ctx.stroke();

  ctx.restore();
}

function gameLoop() {
  timer++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (currentLevel) {
    currentLevel.drawHuman(ctx, canvas.width, canvas.height, timer);

    if (gameRunning) {
      // 蚊子平滑跟隨手指目標點
      mosquito.x += (mosquito.targetX - mosquito.x) * 0.15;
      mosquito.y += (mosquito.targetY - mosquito.y) * 0.15;

      checkBite();
      if (currentLevel.updateSpecial) {
        currentLevel.updateSpecial(gameState);
      }
      updateUI();

      // 勝利條件
      if (gameState.blood >= 100) {
        gameRunning = false;
        modalTitle.textContent = "任務成功！";
        modalDesc.textContent = "你成功吸飽了查克拉，沒有吵醒人類！現在可以體驗測試版成果。";
        startBtn.textContent = "再玩一次";
        overlay.style.display = "flex";
      }

      // 失敗條件
      if (gameState.alert >= 100) {
        gameRunning = false;
        modalTitle.textContent = "啪！被發現了！";
        modalDesc.textContent = "人類警覺爆表，一掌揮了下來！請重試。";
        startBtn.textContent = "重新挑戰";
        overlay.style.display = "flex";
      }
    }
  }

  drawMosquito();
  requestAnimationFrame(gameLoop);
}

// 啟動第一關
initLevel(1);
gameLoop();
