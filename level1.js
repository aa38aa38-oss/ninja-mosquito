window.Level1 = {
  id: 1,
  title: "第一關：熟睡的目標",
  story: "人類正在沉睡。露出的部位有頭部與雙手雙腳。當警戒值升高時，點擊下方「影分身」可留下殘影誘餌並大幅降低警戒！",
  skillName: "忍術：影分身 (降警戒)",
  skillCooldown: 180, // 約3秒 (60幀/秒)

  // 施展技能效果
  activateSkill(state, mosquito) {
    state.alert = Math.max(0, state.alert - 28); // 消除大量警戒
    state.freezeAlertTimer = 100; // 凍結警戒上升約1.5秒
    return {
      x: mosquito.x,
      y: mosquito.y,
      alpha: 1.0 // 殘影透明度
    };
  },

  // 繪製睡眠中的人體（自適應畫布尺寸）
  drawHuman(ctx, width, height, timer) {
    const cx = width / 2;
    const breath = Math.sin(timer * 0.04) * 4;

    // 床墊背景
    ctx.fillStyle = "#242b35";
    ctx.fillRect(width * 0.08, height * 0.08, width * 0.84, height * 0.84);

    // 棉被 (遮蓋身體大部分)
    ctx.fillStyle = "#2f3640";
    ctx.fillRect(width * 0.12, height * 0.32, width * 0.76, height * 0.42);

    // 人體肉色區塊
    ctx.fillStyle = "#f5cd79";

    // 1. 頭部
    const headRadius = Math.min(width * 0.12, 45);
    ctx.beginPath();
    ctx.arc(cx, height * 0.2 + breath, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. 左手露出部分
    ctx.beginPath();
    ctx.ellipse(width * 0.2, height * 0.42 + breath * 0.4, 20, 36, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 3. 右手露出部分
    ctx.beginPath();
    ctx.ellipse(width * 0.8, height * 0.42 + breath * 0.4, 20, 36, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 4. 腳部露出部分
    ctx.beginPath();
    ctx.ellipse(cx, height * 0.84, 45, 24, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  // 動態計算吸血區域
  getBiteZones(width, height) {
    const cx = width / 2;
    const headRadius = Math.min(width * 0.12, 45);

    return [
      { name: "頭部", x: cx, y: height * 0.2, radius: headRadius + 4, alertRate: 0.4, bloodRate: 0.65 },
      { name: "左手", x: width * 0.2, y: height * 0.42, radius: 28, alertRate: 0.22, bloodRate: 0.4 },
      { name: "右手", x: width * 0.8, y: height * 0.42, radius: 28, alertRate: 0.22, bloodRate: 0.4 },
      { name: "腳部", x: cx, y: height * 0.84, radius: 36, alertRate: 0.16, bloodRate: 0.32 }
    ];
  },

  // 特殊環境動態
  updateSpecial(state) {
    if (Math.random() < 0.008) {
      state.alert += 4; // 睡眠中無意識輕微抽動
    }
  }
};
