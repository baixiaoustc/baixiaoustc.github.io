/* ============================================================
 * 骰子大冒险 · 首页：选难度、选小动物、看纪录
 * ============================================================ */

(function () {
  const selection = { size: 'easy', animals: [] };

  const last = loadSetup();
  if (last && SIZES[last.size]) selection.size = last.size;
  if (last && Array.isArray(last.animals)) {
    selection.animals = ANIMAL_ORDER.filter(id => last.animals.indexOf(id) >= 0);
  }
  if (selection.animals.length < MIN_PLAYERS) selection.animals = ANIMAL_ORDER.slice(0, MIN_PLAYERS);

  const sizeBox = document.getElementById('size-options');
  const animalBox = document.getElementById('animal-options');
  const recordBox = document.getElementById('record-list');
  const startBtn = document.getElementById('start-btn');
  const hint = document.getElementById('select-hint');

  function renderSizes() {
    sizeBox.innerHTML = '';
    Object.keys(SIZES).forEach(key => {
      const size = SIZES[key];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pick-card' + (selection.size === key ? ' selected' : '');
      card.dataset.size = key;

      const emoji = document.createElement('span');
      emoji.className = 'pick-emoji';
      emoji.textContent = size.emoji;

      const name = document.createElement('span');
      name.className = 'pick-name';
      name.textContent = size.label;

      const desc = document.createElement('span');
      desc.className = 'pick-desc';
      desc.textContent = size.desc;

      const tip = document.createElement('span');
      tip.className = 'pick-tip';
      tip.textContent = size.hint;

      card.append(emoji, name, desc, tip);
      card.addEventListener('click', () => {
        selection.size = key;
        renderSizes();
        renderHint();
      });
      sizeBox.appendChild(card);
    });
  }

  function renderAnimals() {
    animalBox.innerHTML = '';
    ANIMAL_ORDER.forEach(id => {
      const animal = ANIMALS[id];
      const picked = selection.animals.indexOf(id) >= 0;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pick-card animal-card' + (picked ? ' selected' : '');
      card.style.setProperty('--player-color', animal.color);
      card.dataset.animal = id;

      const emoji = document.createElement('span');
      emoji.className = 'pick-emoji';
      emoji.textContent = animal.icon;

      const name = document.createElement('span');
      name.className = 'pick-name';
      name.textContent = animal.name;

      const desc = document.createElement('span');
      desc.className = 'pick-desc';
      desc.textContent = picked ? '参加 ✅' : '点一下加入';

      card.append(emoji, name, desc);
      card.addEventListener('click', () => {
        const at = selection.animals.indexOf(id);
        if (at >= 0) selection.animals.splice(at, 1);
        else selection.animals.push(id);
        selection.animals = ANIMAL_ORDER.filter(item => selection.animals.indexOf(item) >= 0);
        renderAnimals();
        renderHint();
      });
      animalBox.appendChild(card);
    });
  }

  function renderRules() {
    const list = document.getElementById('rules-list');
    RULES.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    });

    const legend = document.getElementById('rules-legend');
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
      item.append(icon, text);
      legend.appendChild(item);
    });
  }

  function renderRecords() {
    const records = getRecords();
    recordBox.innerHTML = '';

    Object.keys(SIZES).forEach(key => {
      const size = SIZES[key];
      const rec = records[key];
      const row = document.createElement('div');
      row.className = 'record-row';

      const name = document.createElement('span');
      name.className = 'record-name';
      name.textContent = `${size.emoji} ${size.label}`;

      const value = document.createElement('span');
      value.className = 'record-value';
      if (rec) {
        const winner = ANIMALS[rec.winner] ? `${ANIMALS[rec.winner].icon} ${ANIMALS[rec.winner].name}` : '有人';
        value.textContent = `${winner} · ${rec.rounds} 轮 · ${Math.floor(rec.seconds / 60)} 分 ${String(rec.seconds % 60).padStart(2, '0')} 秒`;
      } else {
        value.textContent = '还没有记录，去开一局吧';
        value.classList.add('empty');
      }

      row.append(name, value);
      recordBox.appendChild(row);
    });

    const clearBtn = document.getElementById('clear-records');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (window.confirm('确定要清空所有纪录吗？')) {
          clearRecords();
          renderRecords();
        }
      });
    }
  }

  function renderHint() {
    const count = selection.animals.length;
    const size = SIZES[selection.size];
    if (count < MIN_PLAYERS) {
      hint.textContent = '至少要点 2 只小动物才能开始哦～';
    } else {
      const order = selection.animals.map(id => `${ANIMALS[id].icon}${ANIMALS[id].name}`).join(' → ');
      hint.textContent = `${size.emoji} ${size.label}棋盘 · ${count} 位选手，出牌顺序：${order}`;
    }
    startBtn.disabled = count < MIN_PLAYERS;
  }

  startBtn.addEventListener('click', () => {
    if (selection.animals.length < MIN_PLAYERS) return;
    saveSetup({ size: selection.size, animals: selection.animals });
    const query = `?size=${encodeURIComponent(selection.size)}&players=${encodeURIComponent(selection.animals.join(','))}`;
    window.location.href = './game.html' + query;
  });

  renderSizes();
  renderAnimals();
  renderRules();
  renderRecords();
  renderHint();
})();
