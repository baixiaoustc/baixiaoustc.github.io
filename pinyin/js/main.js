document.addEventListener("DOMContentLoaded", () => {
  const summaryEl = document.getElementById("home-summary");
  if (!summaryEl) return;

  const stats = getStats();
  const overallAccuracy = getAccuracy(stats.overall.total, stats.overall.correct);

  if (stats.overall.total === 0) {
    summaryEl.innerHTML = `
      <p class="empty-state">还没有练习记录，快选择一个难度开始吧！</p>
    `;
    return;
  }

  const levelLabels = { easy: "简单", medium: "中等", hard: "困难" };
  const levelBadges = Object.entries(stats.byLevel)
    .filter(([_, data]) => data.total > 0)
    .map(([level, data]) => {
      const accuracy = getAccuracy(data.total, data.correct);
      return `<span class="word-tag">${levelLabels[level]}: ${data.correct}/${data.total} (${accuracy}%)</span>`;
    })
    .join("");

  summaryEl.innerHTML = `
    <p>你已经练习了 <strong>${stats.overall.total}</strong> 次，总正确率 <strong>${overallAccuracy}%</strong></p>
    <div class="word-list" style="justify-content: center; margin-top: 12px;">${levelBadges}</div>
  `;
});
