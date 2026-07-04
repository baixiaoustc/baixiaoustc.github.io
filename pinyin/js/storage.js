const STORAGE_KEY = "pinyinStats";

function getInitialStats() {
  return {
    version: 1,
    overall: { total: 0, correct: 0 },
    byLevel: {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 }
    },
    items: {}
  };
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialStats();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return getInitialStats();
    return { ...getInitialStats(), ...parsed };
  } catch (e) {
    console.warn("读取本地统计失败", e);
    return getInitialStats();
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn("保存本地统计失败", e);
  }
}

function getItemKey(level, hanzi) {
  return `${level}::${hanzi}`;
}

function recordAttempt(level, hanzi, isCorrect) {
  const stats = loadStats();
  stats.overall.total += 1;
  if (isCorrect) stats.overall.correct += 1;

  if (!stats.byLevel[level]) stats.byLevel[level] = { total: 0, correct: 0 };
  stats.byLevel[level].total += 1;
  if (isCorrect) stats.byLevel[level].correct += 1;

  const key = getItemKey(level, hanzi);
  if (!stats.items[key]) {
    stats.items[key] = { level, hanzi, total: 0, correct: 0, lastSeen: null };
  }
  stats.items[key].total += 1;
  if (isCorrect) stats.items[key].correct += 1;
  stats.items[key].lastSeen = Date.now();

  saveStats(stats);
}

function getStats() {
  return loadStats();
}

function getAccuracy(total, correct) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

function getLevelStats(level) {
  const stats = loadStats();
  const levelStats = stats.byLevel[level] || { total: 0, correct: 0 };
  return {
    ...levelStats,
    accuracy: getAccuracy(levelStats.total, levelStats.correct)
  };
}

function getItemStats(level, hanzi) {
  const stats = loadStats();
  return stats.items[getItemKey(level, hanzi)] || { total: 0, correct: 0, lastSeen: null };
}

function getWeakItems(level, limit = 10) {
  const stats = loadStats();
  return Object.values(stats.items)
    .filter(item => !level || item.level === level)
    .map(item => ({ ...item, accuracy: getAccuracy(item.total, item.correct) }))
    .sort((a, b) => a.accuracy - b.accuracy || a.total - b.total)
    .slice(0, limit);
}

function getStrongItems(level, limit = 10) {
  const stats = loadStats();
  return Object.values(stats.items)
    .filter(item => (!level || item.level === level) && item.total > 0)
    .map(item => ({ ...item, accuracy: getAccuracy(item.total, item.correct) }))
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)
    .slice(0, limit);
}

function clearStats() {
  localStorage.removeItem(STORAGE_KEY);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    loadStats,
    saveStats,
    recordAttempt,
    getStats,
    getAccuracy,
    getLevelStats,
    getItemStats,
    getWeakItems,
    getStrongItems,
    clearStats
  };
}
