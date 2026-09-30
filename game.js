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

let cdCounter = 0; // 忍術冷卻計數
let decoyEffect = null; // 影分身殘影

let mosquito = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  isBiting: false
};

let gameState = {
  blood: 0,
  alert: 0,
  freezeAlertTimer: 0
};

// 畫面解析度隨視窗動態佔滿
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  if (!gameRunning) {
    mosquito.x = canvas.width / 2;
    mosquito.y = canvas.height * 0.85;
    mosquito.targetX = mosquito.x;
    mosquito.targetY = mosquito.y;
  }
}
window.addEventListener("resize", resizeCanvas);

const levels = {
  1: window.Level1,
  2: window.Level2,
  3: window.Level3
};

function initLevel(lvlNum) {
  currentLevel = levels[lvlNum];
  levelDisplay.textContent = currentLevel.id;
  skillBtn.textContent = currentLevel.skillName;
  skillBtn.classList.remove("cooldown");

  gameState.blood = 0;
  gameState.alert = 0;
  gameState.freezeAlertTimer = 0;
  cdCounter = 0;
  decoyEffect = null;

  resizeCanvas();
  mosquito.isBiting = false;
  updateUI();

  modalTitle.textContent = currentLevel.title;
  modalDesc.textContent = currentLevel.story;
  startBtn.textContent = "開始行動";
  overlay.style.display = "flex";
  gameRunning = false;
}

startBtn.addEventListener("click", () => {
  overlay.style.display = "none";
  gameRunning = true;
});
startBtn.addEventListener("touchend", (e) => {
  e.preventDefault();
  overlay.style.display = "none";
  gameRunning = true;
});

// 忍術觸發核心邏輯
function triggerSkill(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  if (!gameRunning) return;
  if (cdCounter > 0) return;
  if (!currentLevel || !currentLevel.activateSkill) return;

  // 施展影分身
  decoyEffect = currentLevel.activateSkill(gameState, mosquito);
  cdCounter = currentLevel.skillCooldown || 180;
  skillBtn.classList.add("cooldown");
}

// 支援手機觸控與電腦點擊，避免事件穿透失靈
skillBtn.addEventListener("touchstart", triggerSkill, { passive: false });
skillBtn.addEventListener("click", triggerSkill);

// 手勢定位計算
function handlePointer(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  mosquito.targetX = clientX - rect.left;
  mosquito.targetY = clientY - rect.top;
}

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!gameRunning) return;
  handlePointer(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

canvas.addEventListener("touchstart", (e) => {
  if (!gameRunning) return;
  handlePointer(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

canvas.addEventListener("mousemove", (e) => {
  if (!gameRunning) return;
  handlePointer(e.clientX, e.clientY);
});

function updateUI() {
  bloodDisplay.textContent = Math.floor(gameState.blood) + "%";
  alertDisplay.textContent = Math.floor(gameState.alert) + "%";
  bloodBar.style.width = Math.min(gameState.blood, 100) + "%";
  alertBar.style.width = Math.min(gameState.alert, 100) + "%";

  // 更新冷卻提示
  if (cdCounter > 0) {
    const sec = Math.ceil(cdCounter / 60);
    skillBtn.textContent = `忍術冷卻中 (${sec}s)`;
  } else {
    skillBtn.textContent = currentLevel.skillName;
    skillBtn.classList.remove("cooldown");
  }
}

function checkBite() {
  const zones = currentLevel.getBiteZones(canvas.width, canvas.height);
  mosquito.isBiting = false;

  for (let zone of zones) {
    const dist = Math.hypot(mosquito.x - zone.x, mosquito.y - zone.y);
    if (dist < zone.radius) {
      mosquito.isBiting = true;
      gameState.blood += zone.bloodRate;
      if (gameState.freezeAlertTimer <= 0) {
        gameState.alert += zone.alertRate;
      }
      break;
    }
  }

  // 離開吸血點時警戒回降
  if (!mosquito.isBiting && gameState.alert > 0) {
    gameState.alert -= 0.18;
    if (gameState.alert < 0) gameState.alert = 0;
  }
}

function drawMosquito(x, y, isBiting, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);

  // 蚊子身軀
  ctx.fillStyle = isBiting ? "#e74c3c" : "#111";
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // 翅膀拍動
  const wingFlap = Math.sin(timer * 0.9) * 10;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 1.6;

  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(-15, -10 + wingFlap);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(15, -10 - wingFlap);
  ctx.stroke();

  // 口器
  ctx.strokeStyle = "#95a5a6";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, -18);
  ctx.stroke();

  ctx.restore();
}

function gameLoop() {
  timer++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (currentLevel) {
    currentLevel.drawHuman(ctx, canvas.width, canvas.height, timer);

    if (gameRunning) {
      // 蚊子跟隨手指
      mosquito.x += (mosquito.targetX - mosquito.x) * 0.18;
      mosquito.y += (mosquito.targetY - mosquito.y) * 0.18;

      if (cdCounter > 0) cdCounter--;
      if (gameState.freezeAlertTimer > 0) gameState.freezeAlertTimer--;

      checkBite();
      if (currentLevel.updateSpecial) {
        currentLevel.updateSpecial(gameState);
      }
      updateUI();

      // 勝利判斷
      if (gameState.blood >= 100) {
        gameRunning = false;
        modalTitle.textContent = "第一關：試煉達成！";
        modalDesc.textContent = "太神啦！你成功吸飽了查克拉並全身而退！";
        startBtn.textContent = "再次挑戰第一關";
        overlay.style.display = "flex";
      }

      // 失敗判斷
      if (gameState.alert >= 100) {
        gameRunning = false;
        modalTitle.textContent = "啪！被巴到了！";
        modalDesc.textContent = "警戒值爆表，人類一掌揮下來！善用影分身忍術來降低警戒吧！";
        startBtn.textContent = "重新挑戰";
        overlay.style.display = "flex";
      }
    }
  }

  // 繪製影分身殘影與煙霧效果
  if (decoyEffect) {
    drawMosquito(decoyEffect.x, decoyEffect.y, false, decoyEffect.alpha);
    // 殘影周圍的查克拉氣息
    ctx.strokeStyle = `rgba(155, 89, 182, ${decoyEffect.alpha * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(decoyEffect.x, decoyEffect.y, (1 - decoyEffect.alpha) * 30 + 10, 0, Math.PI * 2);
    ctx.stroke();

    decoyEffect.alpha -= 0.02;
    if (decoyEffect.alpha <= 0) decoyEffect = null;
  }

  drawMosquito(mosquito.x, mosquito.y, mosquito.isBiting);
  requestAnimationFrame(gameLoop);
}

// 啟動第一關
setTimeout(() => {
  initLevel(1);
  gameLoop();
}, 100);
