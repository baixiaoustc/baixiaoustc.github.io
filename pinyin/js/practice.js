const ROUND_SIZE = 20;
const LEVEL_LABELS = { easy: "简单", medium: "中等", hard: "困难" };
const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"]
];

let currentLevel = null;
let questions = [];
let currentIndex = 0;
let currentInput = "";
let score = 0;
let isRoundFinished = false;
let isTransitioning = false;
let startTime = null;
let timerInterval = null;
let elapsedSeconds = 0;

function init() {
  const params = new URLSearchParams(window.location.search);
  currentLevel = params.get("level");

  if (!PINYIN_DATA[currentLevel]) {
    alert("请选择正确的难度哦！");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("level-name").textContent =
    `当前难度：${LEVEL_LABELS[currentLevel]}`;

  renderKeyboard();
  questions = pickQuestions();
  startTimer();
  loadQuestion();

  document.addEventListener("keydown", handleKeyDown);
}

function pickQuestions() {
  const pool = [...PINYIN_DATA[currentLevel]];
  const stats = getStats();

  pool.sort((a, b) => {
    const sa = stats.items[`${currentLevel}::${a.hanzi}`] || { lastSeen: 0, total: 0 };
    const sb = stats.items[`${currentLevel}::${b.hanzi}`] || { lastSeen: 0, total: 0 };
    if (sa.total !== sb.total) return sa.total - sb.total;
    return sa.lastSeen - sb.lastSeen;
  });

  const selected = [];
  while (selected.length < ROUND_SIZE && pool.length > 0) {
    const idx = Math.floor(Math.random() * Math.min(pool.length, 8));
    selected.push(pool.splice(idx, 1)[0]);
  }
  return selected;
}

function startTimer() {
  startTime = Date.now();
  elapsedSeconds = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
}

function updateTimerDisplay() {
  const timerEl = document.getElementById("timer-display");
  if (timerEl) {
    timerEl.textContent = `⏱️ ${elapsedSeconds}s`;
  }
}

function loadQuestion() {
  currentInput = "";
  isTransitioning = false;
  const item = questions[currentIndex];

  document.getElementById("hanzi-display").textContent = item.hanzi;
  document.getElementById("current-index").textContent = `第 ${currentIndex + 1} 题`;
  document.getElementById("score-display").textContent = `✓ ${score}`;
  document.getElementById("progress-fill").style.width =
    `${((currentIndex + 1) / ROUND_SIZE) * 100}%`;

  hideHint();
  renderInputBoxes(item.pinyin.length);
  updateKeyboardHighlight();
}

function renderInputBoxes(count) {
  const container = document.getElementById("pinyin-input");
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const box = document.createElement("span");
    box.className = "pinyin-letter";
    if (i === 0) box.classList.add("current");
    container.appendChild(box);
  }
}

function updateInputBoxes() {
  const boxes = document.querySelectorAll(".pinyin-letter");
  const target = questions[currentIndex].pinyin;

  boxes.forEach((box, i) => {
    box.classList.remove("filled", "current");
    if (i < currentInput.length) {
      box.textContent = currentInput[i];
      box.classList.add("filled");
    } else {
      box.textContent = "";
    }
    if (i === currentInput.length && currentInput.length < target.length) {
      box.classList.add("current");
    }
  });
}

function renderKeyboard() {
  const container = document.getElementById("keyboard");
  container.innerHTML = "";
  KEYBOARD_ROWS.forEach(row => {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";
    row.forEach(key => {
      const keyEl = document.createElement("div");
      keyEl.className = "key";
      keyEl.dataset.key = key;
      keyEl.textContent = key;
      rowEl.appendChild(keyEl);
    });
    container.appendChild(rowEl);
  });
}

function updateKeyboardHighlight() {
  const target = questions[currentIndex].pinyin;
  const nextChar = target[currentInput.length];
  document.querySelectorAll(".key").forEach(keyEl => {
    keyEl.classList.toggle("target", keyEl.dataset.key === nextChar);
    keyEl.classList.remove("pressed");
  });
}

function handleKeyDown(e) {
  if (isRoundFinished || isTransitioning) return;

  const key = e.key.toLowerCase();
  if (!/^[a-z]$/.test(key)) return;

  e.preventDefault();
  const target = questions[currentIndex].pinyin;
  const expected = target[currentInput.length];

  flashKey(key);

  if (key === expected) {
    currentInput += key;
    updateInputBoxes();
    updateKeyboardHighlight();

    if (currentInput === target) {
      handleCorrect();
    }
  } else {
    handleWrong(target);
  }
}

function flashKey(key) {
  const keyEl = document.querySelector(`.key[data-key="${key}"]`);
  if (keyEl) {
    keyEl.classList.add("pressed");
    setTimeout(() => keyEl.classList.remove("pressed"), 120);
  }
}

function handleCorrect() {
  isTransitioning = true;
  score += 1;
  showFeedback(true);
  recordAttempt(currentLevel, questions[currentIndex].hanzi, true);

  setTimeout(() => {
    hideFeedback();
    currentIndex += 1;
    if (currentIndex >= ROUND_SIZE) {
      finishRound();
    } else {
      loadQuestion();
    }
  }, 700);
}

function handleWrong(target) {
  showFeedback(false);
  const card = document.getElementById("practice-card");
  card.classList.add("shake");
  setTimeout(() => card.classList.remove("shake"), 400);

  showHint(`正确拼音：${target}`);
  recordAttempt(currentLevel, questions[currentIndex].hanzi, false);

  isTransitioning = true;
  setTimeout(() => {
    hideFeedback();
    currentIndex += 1;
    if (currentIndex >= ROUND_SIZE) {
      finishRound();
    } else {
      loadQuestion();
    }
  }, 1600);
}

function showHint(text) {
  const hint = document.getElementById("hint-text");
  hint.textContent = text;
  hint.classList.add("show");
}

function hideHint() {
  const hint = document.getElementById("hint-text");
  hint.classList.remove("show");
}

function showFeedback(isSuccess) {
  const overlay = document.getElementById("feedback-overlay");
  const circle = document.getElementById("feedback-circle");
  circle.textContent = isSuccess ? "✓" : "✗";
  circle.className = `feedback-circle ${isSuccess ? "success" : "error"}`;
  overlay.classList.add("show");
}

function hideFeedback() {
  document.getElementById("feedback-overlay").classList.remove("show");
}

function finishRound() {
  isRoundFinished = true;
  stopTimer();

  const accuracy = getAccuracy(ROUND_SIZE, score);

  document.getElementById("practice-card").classList.add("hidden");
  document.getElementById("result-card").classList.remove("hidden");
  document.getElementById("result-score").textContent = `${score}/${ROUND_SIZE}`;
  document.getElementById("result-accuracy").textContent = `${accuracy}%`;
  document.getElementById("result-time").textContent = `${elapsedSeconds} 秒`;

  const stars = score >= 18 ? "⭐⭐⭐" : score >= 12 ? "⭐⭐" : score >= 1 ? "⭐" : "💪";
  document.getElementById("star-row").textContent = stars;

  let message = "继续加油哦！";
  if (score === ROUND_SIZE) message = "太棒了，全对！你是拼音小达人！";
  else if (score >= 15) message = "做得非常好，再接再厉！";
  else if (score >= 10) message = "不错哦，再多练习会更好！";
  else message = "不要灰心，多练习就会进步！";
  document.getElementById("result-message").textContent = message;

  setTimeout(() => {
    window.location.href = "index.html";
  }, 6000);
}

window.addEventListener("DOMContentLoaded", init);
