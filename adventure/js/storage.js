/* ============================================================
 * 骰子大冒险 · 本地存档（localStorage）
 * 只存两样东西：各难度的最好成绩、上次的选择。
 * 自检页请使用别的 key，别写坏真实记录。
 * ============================================================ */

const ADVENTURE_RECORD_KEY = 'adventureRecords';
const ADVENTURE_SETUP_KEY = 'adventureLastSetup';

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const value = JSON.parse(raw);
    return value === null || value === undefined ? fallback : value;
  } catch (err) {
    return fallback;
  }
}

function getRecords() {
  try {
    const data = safeParse(localStorage.getItem(ADVENTURE_RECORD_KEY), null);
    if (!data || typeof data !== 'object') return {};
    const out = {};
    ['easy', 'medium', 'hard'].forEach(key => {
      const rec = data[key];
      if (rec && typeof rec.rounds === 'number' && rec.rounds > 0) {
        out[key] = {
          rounds: rec.rounds,
          seconds: typeof rec.seconds === 'number' ? rec.seconds : 0,
          players: typeof rec.players === 'number' ? rec.players : 0,
          winner: typeof rec.winner === 'string' ? rec.winner : '',
          date: typeof rec.date === 'string' ? rec.date : ''
        };
      }
    });
    return out;
  } catch (err) {
    return {};
  }
}

/* 更好 = 回合数更少；回合数相同就比用时更短 */
function isBetterRecord(prev, next) {
  if (!prev) return true;
  if (next.rounds !== prev.rounds) return next.rounds < prev.rounds;
  return next.seconds < prev.seconds;
}

/* 返回 true 表示刷新了纪录 */
function saveRecord(sizeKey, record) {
  const records = getRecords();
  const prev = records[sizeKey];
  if (!isBetterRecord(prev, record)) return false;
  records[sizeKey] = record;
  try {
    localStorage.setItem(ADVENTURE_RECORD_KEY, JSON.stringify(records));
  } catch (err) {
    return false;
  }
  return true;
}

function clearRecords() {
  try {
    localStorage.removeItem(ADVENTURE_RECORD_KEY);
  } catch (err) { /* 忽略：隐私模式等 */ }
}

function saveSetup(setup) {
  try {
    localStorage.setItem(ADVENTURE_SETUP_KEY, JSON.stringify(setup));
  } catch (err) { /* 忽略 */ }
}

function loadSetup() {
  try {
    return safeParse(localStorage.getItem(ADVENTURE_SETUP_KEY), null);
  } catch (err) {
    return null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getRecords, saveRecord, clearRecords, saveSetup, loadSetup, isBetterRecord };
}
