document.addEventListener("DOMContentLoaded", () => {
  renderStats();

  const clearBtn = document.getElementById("clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("确定要清空所有学习记录吗？这个操作不能恢复哦。")) {
        clearStats();
        renderStats();
      }
    });
  }
});

function renderStats() {
  const stats = getStats();

  document.getElementById("stat-total").textContent = stats.overall.total;
  document.getElementById("stat-accuracy").textContent =
    getAccuracy(stats.overall.total, stats.overall.correct) + "%";
  document.getElementById("stat-easy").textContent =
    getLevelStats("easy").accuracy + "%";
  document.getElementById("stat-medium").textContent =
    getLevelStats("medium").accuracy + "%";
  document.getElementById("stat-hard").textContent =
    getLevelStats("hard").accuracy + "%";

  const strongContainer = document.getElementById("strong-words");
  const weakContainer = document.getElementById("weak-words");

  strongContainer.innerHTML = renderWordTags(getStrongItems(null, 12), "strong");
  weakContainer.innerHTML = renderWordTags(getWeakItems(null, 12), "weak");
}

function renderWordTags(items, cssClass) {
  if (!items || items.length === 0) {
    return `<span class="empty-state">还没有足够的数据</span>`;
  }
  return items
    .map(
      item =>
        `<span class="word-tag ${cssClass}" title="正确 ${item.correct}/${item.total} 次">${item.hanzi} ${item.accuracy}%</span>`
    )
    .join("");
}
