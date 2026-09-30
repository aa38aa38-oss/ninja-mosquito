window.Level1 = {
  id: 1,
  title: "第一關：熟睡的目標",
  story: "人類正處於熟睡狀態。雖然沒有防備，但翻身與微弱感知仍會驚動他。請尋找露出的四肢或頭部，吸滿查克拉！",
  skillName: "基礎飛行",
  hasActiveSkill: false,

  // 人體繪製與部位設定
  drawHuman(ctx, width, height, timer) {
    // 繪製床鋪與被褥
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(40, 70, width - 80, height - 140);

    ctx.fillStyle = "#34495e";
    ctx.fillRect(40, 180, width - 80, height - 250); // 棉被覆蓋區

    // 呼吸起伏動畫
    const breath = Math.sin(timer * 0.05) * 3;

    // 1. 頭部 (高收益, 高警覺)
    ctx.fillStyle = "#f5cba7";
    ctx.beginPath();
    ctx.arc(width / 2, 120 + breath, 36, 0, Math.PI * 2);
    ctx.fill();

    // 2. 左手露出部分
    ctx.beginPath();
    ctx.ellipse(65, 230 + breath * 0.5, 16, 32, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 3. 右手露出部分
    ctx.beginPath();
    ctx.ellipse(width - 65, 230 + breath * 0.5, 16, 32, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 4. 腳部露出部分
    ctx.beginPath();
    ctx.ellipse(width / 2, height - 100, 32, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  // 吸血判定區域與數值加成
  getBiteZones(width, height) {
    return [
      { name: "頭部", x: width / 2, y: 120, radius: 36, alertRate: 0.45, bloodRate: 0.6 },
      { name: "左手", x: 65, y: 230, radius: 24, alertRate: 0.25, bloodRate: 0.4 },
      { name: "右手", x: width - 65, y: 230, radius: 24, alertRate: 0.25, bloodRate: 0.4 },
      { name: "腳部", x: width / 2, y: height - 100, radius: 28, alertRate: 0.2, bloodRate: 0.35 }
    ];
  },

  // 關卡特殊干擾更新 (第1關為偶爾輕微晃動)
  updateSpecial(state) {
    if (Math.random() < 0.01) {
      state.alert += 3; // 偶爾輕微抓癢警覺提升
    }
  }
};
