/* ============================================================
 * 骰子大冒险 · 界面层
 * 只负责：画棋盘、摆棋子、按引擎给出的「事件列表」播动画、弹提示。
 * 规则逻辑全在 engine.js，这里不做任何判定。
 * ============================================================ */

const AdventureUI = (function () {
  const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  /* 每类事件播多久（毫秒） */
  const DELAY = {
    turnStart: 240, roll: 780, step: 190, land: 420, gainCard: 700,
    freeze: 720, again: 620, jump: 520, home: 760, useCard: 700,
    skip: 820, turnEnd: 110, againTurn: 320, askCard: 260, win: 60
  };

  /* 格子尺寸：必须有下限，否则 9×9 在笔记本屏幕上会小到看不清 */
  const TILE_GAP = 3;        // 与 .board 的 gap 保持一致
  const TILE_PAD = 6;        // 与 .board 的 padding 保持一致
  const MIN_TILE = 62;       // 一格最小 62px：图标 + 文字都看得清
  const MAX_TILE = 132;      // 再大就有点夸张了
  const LABEL_MIN_TILE = 58; // 格子小于这个值才藏掉文字，只留图标
  const ZOOM_MIN = 0.75;
  const ZOOM_MAX = 2;

  let game = null;
  let opts = {};
  let busy = false;
  let els = {};
  let tileEls = [];
  let pieceEls = {};
  let startedAt = 0;
  let timerId = null;
  let diceTimer = null;
  let elapsedSeconds = 0;
  let lastPositions = {};
  let zoom = 1; // 格子大小倍率，小朋友看不清时可以调大

  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  /* ---------------- 初始化 ---------------- */

  function init(state, options) {
    game = state;
    opts = options || {};
    els = {
      wrap: $('board-wrap'),
      board: $('board'),
      pieces: $('pieces'),
      players: $('player-panel'),
      diceFace: $('dice-face'),
      diceNumber: $('dice-number'),
      rollBtn: $('roll-btn'),
      banner: $('banner'),
      bannerText: $('banner-text'),
      prompt: $('prompt-text'),
      turnBadge: $('turn-badge'),
      roundDisplay: $('round-display'),
      timerDisplay: $('timer-display'),
      sizeName: $('size-name'),
      sizeDesc: $('size-desc'),
      cardModal: $('card-modal'),
      cardText: $('card-modal-text'),
      resultModal: $('result-modal'),
      resultTitle: $('result-title'),
      resultNote: $('result-note'),
      resultStats: $('result-stats'),
      resultRank: $('result-rank'),
      rulesModal: $('rules-modal'),
      rulesList: $('rules-list'),
      boardHint: $('board-hint')
    };

    const size = SIZES[game.sizeKey];
    if (els.sizeName) els.sizeName.textContent = `${size.emoji} ${size.label}`;
    if (els.sizeDesc) els.sizeDesc.textContent = size.desc;
    if (els.roundDisplay) els.roundDisplay.textContent = '第 1 轮';

    renderRules();
    renderBoard();
    renderPlayers();
    bindEvents();
    refresh();
  }

  function bindEvents() {
    window.addEventListener('resize', () => {
      sizeBoard();
      layoutPieces(false);
    });

    if (els.rollBtn) els.rollBtn.addEventListener('click', () => fire('onRoll'));

    const zoomIn = $('zoom-in');
    const zoomOut = $('zoom-out');
    if (zoomIn) zoomIn.addEventListener('click', () => setZoom(zoom + 0.25));
    if (zoomOut) zoomOut.addEventListener('click', () => setZoom(zoom - 0.25));

    const rulesBtn = $('rules-btn');
    const rulesClose = $('rules-close');
    if (rulesBtn) rulesBtn.addEventListener('click', () => els.rulesModal.classList.remove('hidden'));
    if (rulesClose) rulesClose.addEventListener('click', () => els.rulesModal.classList.add('hidden'));

    const useBtn = $('card-use-btn');
    const skipBtn = $('card-skip-btn');
    if (useBtn) useBtn.addEventListener('click', () => chooseCard('use'));
    if (skipBtn) skipBtn.addEventListener('click', () => chooseCard('skip'));

    const againBtn = $('result-again');
    const homeBtn = $('result-home');
    if (againBtn) againBtn.addEventListener('click', () => window.location.reload());
    if (homeBtn) homeBtn.addEventListener('click', () => { window.location.href = './index.html'; });

    document.addEventListener('keydown', onKeydown);
  }

  function onKeydown(event) {
    const isSpace = event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar';
    if (!isSpace) return;
    event.preventDefault();
    if (game.pending) { chooseCard('use'); return; }
    fire('onRoll');
  }

  function fire(name, ...args) {
    // 参数一定要转发出去：卡牌弹窗的「用 / 不用」就是靠这个 choice 区分的
    if (typeof opts[name] === 'function') opts[name](...args);
  }

  function chooseCard(choice) {
    if (els.cardModal) els.cardModal.classList.add('hidden');
    fire('onCardChoice', choice);
  }

  /* ---------------- 棋盘 ---------------- */

  function renderBoard() {
    const board = game.board;
    els.board.style.gridTemplateColumns = `repeat(${board.cols}, 1fr)`;
    els.board.style.gridTemplateRows = `repeat(${board.rows}, 1fr)`;
    els.board.classList.toggle('wide', board.cols - board.rows >= 3);
    // dense（藏掉格子上的字）由 sizeBoard 按格子实际大小决定，不再只看列数
    // 只清掉格子，棋子层（#pieces）留在棋盘里当绝对定位的浮层
    Array.prototype.slice.call(els.board.querySelectorAll('.tile')).forEach(el => el.remove());
    els.pieces.innerHTML = '';
    tileEls = [];
    pieceEls = {};

    board.tiles.forEach(tile => {
      const el = document.createElement('div');
      el.className = `tile tile-${tile.type}`;
      el.style.setProperty('--tile-color', tile.color);
      el.dataset.index = String(tile.index);
      el.title = `第 ${tile.index} 格 · ${tile.label}`;

      const num = document.createElement('span');
      num.className = 'tile-num';
      num.textContent = String(tile.index);

      const icon = document.createElement('span');
      icon.className = 'tile-icon';
      icon.textContent = tile.icon;

      const label = document.createElement('span');
      label.className = 'tile-label';
      label.textContent = tile.label;

      el.appendChild(num);
      el.appendChild(icon);
      el.appendChild(label);
      els.board.appendChild(el);
      tileEls.push(el);
    });

    game.players.forEach(p => {
      const el = document.createElement('div');
      el.className = 'piece';
      el.style.setProperty('--piece-color', p.color);
      el.textContent = p.icon;
      el.title = p.name;
      els.pieces.appendChild(el);
      pieceEls[p.id] = el;
    });

    sizeBoard();
    layoutPieces(false);
  }

  /* 棋盘始终是正方形格子：先按可用宽高算格子，再夹在 MIN/MAX 之间。
     格子有下限，所以 9×9 也不会小到看不清；实在装不下就让 board-wrap 滚动。 */
  function sizeBoard() {
    const board = game.board;
    const wrapWidth = (els.wrap && els.wrap.clientWidth) || window.innerWidth - 32;
    let availHeight = window.innerHeight - 320;
    if (els.wrap && typeof els.wrap.getBoundingClientRect === 'function') {
      const rect = els.wrap.getBoundingClientRect();
      // 页面已经滚动过时 rect.top 会是负数，夹到 0，别算出离谱的高度
      availHeight = window.innerHeight - Math.max(rect.top, 0) - 28;
    }
    const usableW = wrapWidth - ((board.cols - 1) * TILE_GAP + TILE_PAD * 2);
    const usableH = Math.max(availHeight, 200) - ((board.rows - 1) * TILE_GAP + TILE_PAD * 2);
    const natural = Math.min(usableW / board.cols, usableH / board.rows);
    // 取整到 0.5px：宁可小一点点，也别因为四舍五入把棋盘顶出容器
    const tile = Math.floor(Math.max(MIN_TILE, Math.min(natural * zoom, MAX_TILE)) * 2) / 2;

    const width = tile * board.cols + (board.cols - 1) * TILE_GAP + TILE_PAD * 2;
    const height = tile * board.rows + (board.rows - 1) * TILE_GAP + TILE_PAD * 2;
    els.board.style.width = Math.round(width) + 'px';
    els.board.style.height = Math.round(height) + 'px';
    // 字号跟着格子大小走，9×9 也不会挤成一团
    els.board.style.setProperty('--tile-size', tile.toFixed(1) + 'px');
    // 格子够大就写字，太小才只留图标
    els.board.classList.toggle('dense', tile < LABEL_MIN_TILE);
    if (els.boardHint) {
      const overflowing = width > wrapWidth + 1 || height > Math.max(availHeight, 200) + 1;
      els.boardHint.classList.toggle('hidden', !overflowing);
    }
  }

  function setZoom(next) {
    zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(next * 100) / 100));
    sizeBoard();
    layoutPieces(false);
  }

  function slotOffset(count, k, tileW, tileH, size) {
    if (count === 1) return { dx: (tileW - size) / 2, dy: (tileH - size) / 2 };
    if (count === 2) {
      return k === 0
        ? { dx: tileW * 0.06, dy: tileH * 0.06 }
        : { dx: tileW * 0.94 - size, dy: tileH * 0.94 - size };
    }
    const corners = [
      { dx: tileW * 0.04, dy: tileH * 0.04 },
      { dx: tileW * 0.96 - size, dy: tileH * 0.04 },
      { dx: tileW * 0.04, dy: tileH * 0.96 - size },
      { dx: tileW * 0.96 - size, dy: tileH * 0.96 - size }
    ];
    return corners[k % 4];
  }

  function layoutPieces(animate) {
    const groups = {};
    game.players.forEach(p => {
      if (!groups[p.pos]) groups[p.pos] = [];
      groups[p.pos].push(p);
    });

    Object.keys(groups).forEach(posKey => {
      const list = groups[posKey];
      const tileEl = tileEls[Number(posKey)];
      if (!tileEl) return;
      const tileW = tileEl.offsetWidth;
      const tileH = tileEl.offsetHeight;
      // 挤在一格上的人多时棋子小一点，别把格子上的图标和字挡严实
      const size = Math.max(Math.round(tileW * (list.length >= 3 ? 0.5 : 0.62)), 12);

      list.forEach((p, k) => {
        const el = pieceEls[p.id];
        if (!el) return;
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.fontSize = Math.round(size * 0.8) + 'px';
        el.style.zIndex = String(10 + k);
        const slot = slotOffset(list.length, k, tileW, tileH, size);
        const x = tileEl.offsetLeft + slot.dx;
        const y = tileEl.offsetTop + slot.dy;
        if (animate === false) el.classList.add('no-anim');
        el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
        if (animate === false) {
          void el.offsetWidth; // 强制回流，避免下次移动没有动画
          el.classList.remove('no-anim');
        }
      });
    });
  }

  function playerCard(id) {
    return els.players ? els.players.querySelector(`.player-card[data-id="${id}"]`) : null;
  }

  function renderPlayers() {
    els.players.innerHTML = '';
    game.players.forEach(p => {
      const card = document.createElement('div');
      card.className = 'player-card';
      card.dataset.id = p.id;
      card.style.setProperty('--player-color', p.color);

      const icon = document.createElement('div');
      icon.className = 'pc-icon';
      icon.textContent = p.icon;

      const body = document.createElement('div');
      body.className = 'pc-body';

      const name = document.createElement('div');
      name.className = 'pc-name';
      name.textContent = p.name;

      const meta = document.createElement('div');
      meta.className = 'pc-meta';
      const pos = document.createElement('span');
      pos.className = 'pc-pos';
      const cards = document.createElement('span');
      cards.className = 'pc-cards';
      const frozen = document.createElement('span');
      frozen.className = 'pc-frozen';
      meta.appendChild(pos);
      meta.appendChild(cards);
      meta.appendChild(frozen);
      body.appendChild(name);
      body.appendChild(meta);
      card.appendChild(icon);
      card.appendChild(body);
      els.players.appendChild(card);
    });
    refreshPlayers();
  }

  function refreshPlayers() {
    game.players.forEach(p => {
      const card = playerCard(p.id);
      if (!card) return;
      const pos = card.querySelector('.pc-pos');
      const cards = card.querySelector('.pc-cards');
      const frozen = card.querySelector('.pc-frozen');
      if (pos) pos.textContent = `第 ${p.pos} 格`;
      if (cards) cards.textContent = `🎁 ${p.cards}`;
      if (frozen) {
        frozen.textContent = p.frozen > 0 ? `❄️ ${p.frozen}` : '';
        frozen.classList.toggle('hidden', p.frozen <= 0);
      }
      card.classList.toggle('active', game.winner ? game.winner === p.id : game.players[game.turn].id === p.id);
      card.classList.toggle('winner', game.winner === p.id);
      card.classList.toggle('frozen', p.frozen > 0);
    });
  }

  function renderRules() {
    if (!els.rulesList) return;
    els.rulesList.innerHTML = '';
    RULES.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      els.rulesList.appendChild(li);
    });
    const legend = $('rules-legend');
    if (legend) {
      legend.innerHTML = '';
      Object.keys(TILE_META).forEach(type => {
        const meta = TILE_META[type];
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.style.setProperty('--tile-color', meta.color);
        const icon = document.createElement('span');
        icon.className = 'legend-icon';
        icon.textContent = meta.icon;
        const text = document.createElement('span');
        text.className = 'legend-text';
        text.textContent = `${meta.label} — ${meta.note}`;
        item.appendChild(icon);
        item.appendChild(text);
        legend.appendChild(item);
      });
    }
  }

  /* ---------------- 提示区 ---------------- */

  function setBanner(text, kind) {
    if (!els.bannerText) return;
    els.bannerText.textContent = text;
    els.banner.className = 'banner' + (kind ? ' banner-' + kind : '');
  }

  function refresh() {
    const p = game.players[game.turn];
    if (els.turnBadge) {
      els.turnBadge.textContent = game.winner
        ? `${ANIMALS[game.winner].icon} ${ANIMALS[game.winner].name} 获胜`
        : `${p.icon} ${p.name} 的回合`;
      els.turnBadge.style.setProperty('--player-color', game.winner ? ANIMALS[game.winner].color : p.color);
    }
    if (els.roundDisplay) els.roundDisplay.textContent = `第 ${game.round} 轮`;
    if (els.diceNumber) els.diceNumber.textContent = game.dice ? `${game.dice} 点` : '还没摇';

    if (els.prompt) {
      if (game.winner) els.prompt.textContent = '🎉 游戏结束，看看谁赢了！';
      else if (game.pending) els.prompt.textContent = '请决定要不要用卡牌抵消';
      else if (busy) els.prompt.textContent = '走棋中……';
      else els.prompt.textContent = `${p.icon} ${p.name}，按空格摇骰子`;
    }
    if (els.rollBtn) {
      els.rollBtn.disabled = busy || !!game.winner || !!game.pending;
      els.rollBtn.classList.toggle('ready', !els.rollBtn.disabled);
    }
    refreshPlayers();
  }

  function animateDice(value, duration) {
    if (!els.diceFace) return;
    clearInterval(diceTimer);
    els.diceFace.classList.add('rolling');
    const t0 = Date.now();
    diceTimer = setInterval(() => {
      els.diceFace.textContent = DIE_FACES[Math.floor(Math.random() * 6)];
      if (Date.now() - t0 >= duration - 100) {
        clearInterval(diceTimer);
        els.diceFace.textContent = DIE_FACES[value - 1];
        els.diceFace.classList.remove('rolling');
      }
    }, 70);
  }

  /* ---------------- 事件回放 ---------------- */

  async function runEvents(events) {
    if (!events || !events.length) { refresh(); return; }
    busy = true;
    refresh();

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      handleEvent(ev);
      await sleep(DELAY[ev.type] === undefined ? 200 : DELAY[ev.type]);

      if (ev.type === 'askCard') {
        busy = false;
        refresh();
        if (els.cardText) {
          els.cardText.textContent = `${name(ev.player)} 走到了「回到起点」！手里有 ${ev.cards} 张卡牌，要用一张抵消吗？（按空格 = 用）`;
        }
        els.cardModal.classList.remove('hidden');
        return;
      }
      if (ev.type === 'win') {
        busy = false;
        showResult(ev);
        return;
      }
    }

    busy = false;
    refresh();
  }

  function name(id) {
    const p = game.players.find(item => item.id === id);
    return p ? `${p.icon} ${p.name}` : id;
  }

  function handleEvent(ev) {
    switch (ev.type) {
      case 'turnStart':
        setBanner(`轮到 ${name(ev.player)} 了`, 'turn');
        break;

      case 'roll':
        stateDice(ev.value, ev.player);
        break;

      case 'step':
        movePlayer(ev.player, ev.to);
        break;

      case 'land':
        setBanner(`${name(ev.player)} 走到第 ${ev.pos} 格 · ${ev.tile.icon} ${ev.tile.label}`);
        break;

      case 'gainCard':
        setBanner(`${name(ev.player)} 拿到一张卡牌 🎁（现在有 ${ev.cards} 张）`, 'good');
        refresh();
        break;

      case 'freeze':
        setBanner(`${name(ev.player)} 被冻住了 ❄️ 接下来 ${ev.turns} 轮都要跳过`, 'bad');
        refresh();
        break;

      case 'again':
        setBanner(`${name(ev.player)} 可以再扔一次骰子 🎲`, 'good');
        break;

      case 'jump':
        movePlayer(ev.player, ev.to);
        setBanner(ev.dir === 'forward'
          ? `${name(ev.player)} 坐上顺风车，前进 ${ev.steps} 步 ➡️`
          : `${name(ev.player)} 被拉回来，后退 ${ev.steps} 步 ⬅️`, ev.dir === 'forward' ? 'good' : 'bad');
        break;

      case 'home':
        movePlayer(ev.player, ev.to);
        setBanner(`${name(ev.player)} 被吹回起点 🌀`, 'bad');
        refresh();
        break;

      case 'useCard':
        setBanner(`${name(ev.player)} 用掉一张卡牌，留在原地！🛡️（还剩 ${ev.cards} 张）`, 'good');
        refresh();
        break;

      case 'skip':
        setBanner(`${name(ev.player)} 被冻住了，跳过这一轮 ❄️（还剩 ${ev.remaining} 轮）`, 'bad');
        refresh();
        break;

      case 'againTurn':
        setBanner(`还是 ${name(ev.player)} 的回合，再摇一次吧 🎲`, 'good');
        refresh();
        break;

      case 'win':
        setBanner(`${name(ev.player)} 到达终点，赢啦！🏆`, 'good');
        break;

      case 'turnEnd':
      case 'askCard':
      default:
        break;
    }
  }

  function stateDice(value, player) {
    game.dice = value;
    animateDice(value, DELAY.roll);
    setBanner(`${name(player)} 摇出了 ${value} 点！`, 'turn');
    if (els.diceNumber) els.diceNumber.textContent = `${value} 点`;
  }

  function movePlayer(id, to) {
    const p = game.players.find(item => item.id === id);
    if (!p) return;
    p.pos = to;
    layoutPieces(true);
    refreshPlayers();
  }

  /* ---------------- 结果 ---------------- */

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} 分 ${String(s).padStart(2, '0')} 秒`;
  }

  function showResult(ev) {
    const winner = game.players.find(p => p.id === ev.player);
    const note = typeof opts.onWin === 'function' ? opts.onWin(ev) : '';

    if (els.resultTitle) els.resultTitle.textContent = `${winner.icon} ${winner.name} 获胜！`;

    const stats = [
      ['🎲 总回合', `${ev.round} 轮`],
      ['⏱️ 用时', formatTime(elapsedSeconds)],
      ['🐾 走了', `${winner.steps} 格`],
      ['🎁 用卡牌', `${winner.usedCards} 张`],
      ['🌀 被吹回', `${winner.homeCount} 次`],
      ['❄️ 被冻住', `${winner.skips} 次`]
    ];
    if (els.resultStats) {
      els.resultStats.innerHTML = '';
      stats.forEach(([label, value]) => {
        const box = document.createElement('div');
        box.className = 'stat-box';
        const l = document.createElement('span');
        l.className = 'stat-label';
        l.textContent = label;
        const v = document.createElement('span');
        v.className = 'stat-value';
        v.textContent = value;
        box.appendChild(l);
        box.appendChild(v);
        els.resultStats.appendChild(box);
      });
    }

    if (els.resultRank) {
      const rank = game.players
        .slice()
        .sort((a, b) => (b.pos - a.pos) || (a.seat - b.seat))
        .map((p, i) => `${i + 1}. ${p.icon} ${p.name} — 第 ${p.pos} 格`)
        .join('　');
      els.resultRank.textContent = rank;
    }

    if (els.resultNote) {
      els.resultNote.textContent = note || '';
      els.resultNote.classList.toggle('hidden', !note);
    }

    els.resultModal.classList.remove('hidden');
  }

  function startTimer() {
    startedAt = Date.now();
    clearInterval(timerId);
    timerId = setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      if (els.timerDisplay) els.timerDisplay.textContent = formatTime(elapsedSeconds);
      if (!els.timerDisplay) return;
    }, 1000);
    if (els.timerDisplay) els.timerDisplay.textContent = '0 分 00 秒';
  }

  function stopTimer() {
    clearInterval(timerId);
    elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
  }

  function isBusy() {
    return busy;
  }

  return { init, runEvents, isBusy, startTimer, stopTimer, refresh, setBanner, getElapsed: () => elapsedSeconds };
})();
