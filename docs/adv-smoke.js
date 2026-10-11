/* ============================================================
 * 骰子大冒险 · 无浏览器冒烟测试（开发用，不参与网站发布）
 *
 * 这台机器上跑不起 headless Chrome，所以这里手写了一个够用的迷你 DOM，
 * 直接把 adventure/ 下的真实 HTML + JS 跑起来：
 *   1. index.html + setup.js ：选难度、选动物、开始游戏、清空纪录
 *   2. game.html + game.js   ：画棋盘、按空格摇骰子，一直玩到有人赢
 *   3. test.html             ：页面内自检的分支必须全绿
 *
 * 跑法： node docs/adv-smoke.js
 * ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ADV = path.join(ROOT, 'adventure');

let pass = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) { pass++; return true; }
  failures.push(name + (detail === undefined ? '' : ' → ' + detail));
  return false;
}
function eq(name, actual, expected) { return ok(name, actual === expected, `实际 ${JSON.stringify(actual)}，期望 ${JSON.stringify(expected)}`); }

/* ==================== 迷你 DOM ==================== */

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

class El {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.nodeType = String(tag).startsWith('#') ? (tag === '#text' ? 3 : 9) : 1;
    this.children = [];
    this.parentNode = null;
    this.attrs = {};
    this._classes = new Set();
    this._text = '';
    this.handlers = {};
    this.dataset = {};
    this.disabled = false;
    this.checked = false;
    this.value = '';
    this.title = '';
    this.type = '';
    this.gridCols = 0;
    this.gridRows = 0;
    this._props = {};

    const self = this;
    this.style = new Proxy({}, {
      set(target, key, value) {
        if (key === 'gridTemplateColumns') {
          const m = /repeat\(\s*(\d+)/.exec(String(value));
          if (m) self.gridCols = Number(m[1]);
        }
        if (key === 'gridTemplateRows') {
          const m = /repeat\(\s*(\d+)/.exec(String(value));
          if (m) self.gridRows = Number(m[1]);
        }
        self._props[key] = value;
        return true;
      },
      get(target, key) {
        if (key === 'setProperty') return (k, v) => { self._props[k] = v; };
        if (key === 'getPropertyValue') return k => (self._props[k] === undefined ? '' : String(self._props[k]));
        if (key === 'removeProperty') return k => { delete self._props[k]; };
        return self._props[key] === undefined ? '' : self._props[key];
      }
    });

    this.classList = {
      add: (...cs) => cs.forEach(c => self._classes.add(c)),
      remove: (...cs) => cs.forEach(c => self._classes.delete(c)),
      contains: c => self._classes.has(c),
      toggle: (c, force) => {
        const on = force === undefined ? !self._classes.has(c) : !!force;
        if (on) self._classes.add(c); else self._classes.delete(c);
        return on;
      }
    };
  }

  get className() { return Array.from(this._classes).join(' '); }
  set className(v) { this._classes = new Set(String(v).split(/\s+/).filter(Boolean)); }
  get id() { return this.attrs.id || ''; }
  get href() { return this.attrs.href || ''; }
  set href(v) { this.attrs.href = v; }

  get textContent() {
    if (this.nodeType === 3 || !this.children.length) return this._text;
    return this.children.map(c => c.textContent).join('');
  }
  set textContent(v) {
    if (!this._history) this._history = [];
    this._history.push(String(v)); // 只测试用：看看这条提示先后写过什么
    this.children = [];
    this._text = String(v);
  }

  set innerHTML(v) {
    if (String(v).trim() !== '') throw new Error('迷你 DOM 不支持写入 innerHTML：' + String(v).slice(0, 60));
    this.children = [];
    this._text = '';
  }
  get innerHTML() { return this.textContent; }

  appendChild(child) {
    if (child && child.parentNode) child.remove();
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  append(...nodes) {
    nodes.forEach(n => {
      if (typeof n === 'string') { const t = new El('#text'); t._text = n; this.appendChild(t); }
      else this.appendChild(n);
    });
  }
  remove() {
    if (!this.parentNode) return;
    const i = this.parentNode.children.indexOf(this);
    if (i >= 0) this.parentNode.children.splice(i, 1);
    this.parentNode = null;
  }
  addEventListener(type, fn) { (this.handlers[type] = this.handlers[type] || []).push(fn); }
  dispatch(type, extra) {
    const ev = Object.assign({ type, target: this, preventDefault() {}, stopPropagation() {} }, extra || {});
    (this.handlers[type] || []).forEach(fn => fn(ev));
  }
  click() { this.dispatch('click'); }

  get offsetWidth() { return this._classes.has('tile') ? 44 : 40; }
  get offsetHeight() { return this._classes.has('tile') ? 44 : 40; }
  get offsetLeft() {
    if (!this._classes.has('tile')) return 0;
    const cols = (this.parentNode && this.parentNode.gridCols) || 5;
    return (Number(this.dataset.index || 0) % cols) * 44;
  }
  get offsetTop() {
    if (!this._classes.has('tile')) return 0;
    const cols = (this.parentNode && this.parentNode.gridCols) || 5;
    return Math.floor(Number(this.dataset.index || 0) / cols) * 44;
  }
  get clientWidth() { return 760; }
  get clientHeight() { return 700; }
  getBoundingClientRect() {
    return {
      top: 120, left: 0, right: this.clientWidth, bottom: 120 + this.clientHeight,
      width: this.clientWidth, height: this.clientHeight, x: 0, y: 120
    };
  }

  matches(sel) { return matchSel(this, parseSel(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  querySelectorAll(sel) {
    if (/[\s>,+]/.test(sel.trim())) throw new Error('迷你 DOM 不支持这种选择器：' + sel);
    const want = parseSel(sel);
    const out = [];
    const walk = node => node.children.forEach(c => {
      if (c.nodeType !== 1) return;
      if (matchSel(c, want)) out.push(c);
      walk(c);
    });
    walk(this);
    return out;
  }
}

function parseSel(sel) {
  const out = { tag: null, id: null, classes: [], attrs: [] };
  const re = /\[([^\]]+)\]|([.#]?)([A-Za-z][\w-]*)/g;
  let m;
  while ((m = re.exec(sel))) {
    if (m[1]) {
      const i = m[1].indexOf('=');
      const key = i < 0 ? m[1] : m[1].slice(0, i);
      const val = i < 0 ? null : m[1].slice(i + 1).replace(/^["']|["']$/g, '');
      out.attrs.push([key, val]);
    } else if (m[2] === '.') out.classes.push(m[3]);
    else if (m[2] === '#') out.id = m[3];
    else out.tag = m[3].toLowerCase();
  }
  return out;
}

function matchSel(el, sel) {
  if (el.nodeType !== 1) return false;
  if (sel.tag && el.tagName.toLowerCase() !== sel.tag) return false;
  if (sel.id && el.id !== sel.id) return false;
  if (!sel.classes.every(c => el._classes.has(c))) return false;
  return sel.attrs.every(([key, val]) => {
    const have = key.startsWith('data-')
      ? el.dataset[key.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())]
      : el.attrs[key];
    if (val === null) return have !== undefined && have !== null && have !== false;
    return String(have) === val;
  });
}

function parseHTML(html) {
  const clean = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  const root = new El('#document');
  const stack = [root];
  const re = /<(\/?)([A-Za-z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m, last = 0;
  while ((m = re.exec(clean))) {
    const text = clean.slice(last, m.index);
    last = re.lastIndex;
    if (text.trim()) {
      const t = new El('#text');
      t._text = text.replace(/\s+/g, ' ');
      stack[stack.length - 1].appendChild(t);
    }
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const attrText = m[3] || '';
    const selfClose = m[4] === '/' || VOID_TAGS.has(tag);
    if (closing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tagName.toLowerCase() === tag) { stack.length = i; break; }
      }
      continue;
    }
    const el = new El(tag);
    const are = /([\w:-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g;
    let a;
    while ((a = are.exec(attrText))) {
      const key = a[1];
      let val = a[2] === undefined ? '' : a[2].replace(/^["']|["']$/g, '');
      if (key === 'class') el.className = val;
      else if (key === 'id') el.attrs.id = val;
      else el.attrs[key] = val;
    }
    stack[stack.length - 1].appendChild(el);
    if (!selfClose) stack.push(el);
  }
  return root;
}

function extractScripts(html) {
  const out = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const src = /src\s*=\s*["']([^"']+)["']/.exec(m[1]);
    out.push(src ? { file: src[1] } : { code: m[2] });
  }
  return out;
}

function makeLocalStorage(seed) {
  const data = Object.assign({}, seed || {});
  return {
    _data: data,
    getItem: k => (Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: k => { delete data[k]; },
    clear: () => { Object.keys(data).forEach(k => delete data[k]); }
  };
}

/* 把一个页面（真实 HTML + 真实 JS）装进 vm 跑起来 */
function loadPage(htmlName, options) {
  const opts = options || {};
  const htmlPath = path.join(ADV, htmlName);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const doc = parseHTML(html);
  const byId = new Map();
  (function collect(node) {
    if (node.id) byId.set(node.id, node);
    node.children.forEach(collect);
  })(doc);

  const errors = [];
  const missingIds = [];
  const timers = [];
  const docHandlers = {};
  const winHandlers = {};

  const documentShim = {
    nodeType: 9,
    documentElement: doc,
    body: doc.querySelector('body') || doc,
    title: (/<title>([\s\S]*?)<\/title>/i.exec(html) || [, ''])[1],
    getElementById(id) {
      if (!byId.has(id)) { missingIds.push(id); return null; }
      return byId.get(id);
    },
    createElement: tag => new El(tag),
    addEventListener(type, fn) { (docHandlers[type] = docHandlers[type] || []).push(fn); },
    querySelector: sel => doc.querySelector(sel),
    querySelectorAll: sel => doc.querySelectorAll(sel),
    dispatch(type, extra) { (docHandlers[type] || []).forEach(fn => fn(Object.assign({ type, preventDefault() {} }, extra || {}))); }
  };

  const location = {
    search: opts.search || '',
    href: 'file://' + htmlPath,
    reloaded: false,
    reload() { this.reloaded = true; }
  };

  const localStorage = makeLocalStorage(opts.storage);

  const windowShim = {
    innerWidth: 1280,
    innerHeight: 900,
    location,
    localStorage,
    document: documentShim,
    confirm: () => (opts.confirm === undefined ? true : opts.confirm),
    addEventListener(type, fn) { (winHandlers[type] = winHandlers[type] || []).push(fn); },
    dispatch(type, extra) { (winHandlers[type] || []).forEach(fn => fn(Object.assign({ type }, extra || {}))); }
  };

  const FAST = opts.slow ? 1 : 0.2; // 动画延时压缩，跑得快一点
  const sandbox = {
    window: windowShim,
    document: documentShim,
    location,
    localStorage,
    console,
    URLSearchParams,
    confirm: windowShim.confirm,
    setTimeout: (fn, ms) => { const t = setTimeout(fn, Math.max(1, Math.round((ms || 0) * FAST))); timers.push(t); return t; },
    clearTimeout: t => clearTimeout(t),
    setInterval: (fn, ms) => { const t = setInterval(fn, Math.max(1, Math.round((ms || 0) * FAST))); if (t.unref) t.unref(); timers.push(t); return t; },
    clearInterval: t => clearInterval(t),
    requestAnimationFrame: fn => setTimeout(fn, 1)
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;

  const context = vm.createContext(sandbox);

  /* 剧本化随机数：只有引擎的 rollDice 拿到剧本里的点数，骰子动画随便转 */
  if (opts.scriptedRandom) {
    vm.runInContext(`(function () {
      var queue = ${JSON.stringify(opts.scriptedRandom)}, i = 0;
      Math.random = function () {
        var stack = (new Error()).stack || '';
        if (stack.indexOf('rollDice') >= 0 && i < queue.length) return queue[i++];
        return 0.5;
      };
    })();`, context, { filename: 'scripted-random.js' });
  }

  const scripts = extractScripts(html);
  const sources = scripts.map(s => {
    if (s.file) {
      const file = path.join(ADV, s.file);
      if (!fs.existsSync(file)) { errors.push('缺少脚本文件 ' + s.file); return ''; }
      return fs.readFileSync(file, 'utf8');
    }
    return s.code;
  });

  const epilogue = `
;globalThis.__PAGE__ = {
  AdventureUI: typeof AdventureUI !== 'undefined' ? AdventureUI : null,
  SIZES: typeof SIZES !== 'undefined' ? SIZES : null,
  RULES: typeof RULES !== 'undefined' ? RULES : null,
  TILE_META: typeof TILE_META !== 'undefined' ? TILE_META : null
};`;
  const bundle = sources.join('\n;\n') + '\n' + epilogue;

  try {
    vm.runInContext(bundle, context, { filename: htmlName + '.bundle.js' });
  } catch (err) {
    errors.push(htmlName + ' 加载时抛异常：' + (err && err.stack ? err.stack.split('\n').slice(0, 3).join(' | ') : err));
  }

  return {
    html, htmlName, doc, byId, documentShim, windowShim, location, localStorage,
    errors, missingIds, timers, sandbox,
    exports: sandbox.__PAGE__ || {},
    el: id => byId.get(id),
    visible: id => { const e = byId.get(id); return !!e && !e._classes.has('hidden'); },
    cleanup() { timers.forEach(t => { try { clearTimeout(t); clearInterval(t); } catch (e) {} }); }
  };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* 等界面空下来（动画播完） */
async function settle(page, timeoutMs) {
  const btn = page.el('roll-btn');
  const t0 = Date.now();
  while (Date.now() - t0 < (timeoutMs || 8000)) {
    const result = page.visible('result-modal');
    const card = page.visible('card-modal');
    if (result || card || !btn.disabled) return { result, card };
    await sleep(2);
  }
  throw new Error('等界面空闲超时');
}
function pressSpace(page) { page.documentShim.dispatch('keydown', { code: 'Space', key: ' ' }); }

/* ==================== 一、对局页 game.html ==================== */

async function testGamePage() {
  const page = loadPage('game.html', { search: '?size=easy&players=rabbit,chick' });
  ok('game.html 脚本加载无异常', page.errors.length === 0, page.errors.join('；'));

  const board = page.el('board');
  const pieces = page.el('pieces');
  const panel = page.el('player-panel');
  const tiles = board.querySelectorAll('.tile');

  eq('简单棋盘画出 20 个格子', tiles.length, 20);
  ok('棋子层 #pieces 仍在棋盘里（没被重画棋盘时删掉）', pieces && pieces.parentNode === board);
  eq('两个玩家各有一枚棋子', pieces.querySelectorAll('.piece').length, 2);
  eq('玩家面板有两张卡片', panel.querySelectorAll('.player-card').length, 2);

  const tileSize = board.style.getPropertyValue('--tile-size');
  ok('棋盘算出了格子大小 --tile-size', /^\d+(\.\d+)?px$/.test(tileSize), tileSize);
  ok('棋盘宽度写成了像素值', /px$/.test(String(board.style.width)), String(board.style.width));
  ok('简单棋盘格子不小于下限（看得清）', parseFloat(tileSize) >= 62, tileSize);
  eq('棋盘是最小格（第 1 格）到终点', tiles[0]._classes.has('tile-start') && tiles[19]._classes.has('tile-goal'), true);
  ok('每格都有图标和说明', tiles.every(t => t.querySelector('.tile-icon').textContent && t.querySelector('.tile-label').textContent));

  const pieces0 = pieces.querySelectorAll('.piece');
  ok('棋子摆到了棋盘上（transform 不是 NaN）',
    pieces0.every(p => /translate\(\d+px, \d+px\)/.test(p.style.transform)), pieces0.map(p => p.style.transform).join(' / '));
  ok('棋子大小按格子缩放', pieces0.every(p => parseInt(p.style.width, 10) > 0), pieces0.map(p => p.style.width).join(','));

  ok('顶栏显示难度', page.el('size-name').textContent.includes('简单'), page.el('size-name').textContent);
  ok('顶栏显示说明', page.el('size-desc').textContent.length > 0);
  eq('规则列表条数 = RULES', page.el('rules-list').querySelectorAll('li').length, page.exports.RULES.length);
  eq('图例列出了所有格子类型', page.el('rules-legend').querySelectorAll('.legend-item').length, Object.keys(page.exports.TILE_META).length);

  /* 规则弹窗 */
  page.el('rules-btn').click();
  ok('点「规则」会弹出说明', page.visible('rules-modal'));
  page.el('rules-close').click();
  ok('点「知道啦」会关掉说明', !page.visible('rules-modal'));

  /* 棋盘上真的把 8 种效果格都排开了 */
  const types = tiles.map(t => Array.from(t._classes).find(c => c.startsWith('tile-') && c !== 'tile-major' && c !== 'tile-num'));
  ok('棋盘上起点和终点各只有一个',
    types.filter(t => t === 'tile-start').length === 1 && types.filter(t => t === 'tile-goal').length === 1);

  /* 一直按空格，把一局玩完 */
  let presses = 0, cardPrompts = 0, cardHandled = 0, diceValues = new Set(), sawResult = false, crash = null;
  const before = page.el('banner-text').textContent;
  try {
    while (presses < 600) {
      const state = await settle(page);
      if (state.result) { sawResult = true; break; }
      const dice = page.el('dice-number').textContent;
      if (/^\d 点$/.test(dice)) diceValues.add(Number(dice[0]));
      pressSpace(page);
      presses++;
      if (state.card) {
        cardPrompts++;
        const after = await settle(page);
        if (!after.card) cardHandled++;
      }
      await sleep(1);
    }
  } catch (err) {
    crash = err.message;
  }

  ok('按空格真的能一直把一局走完，没有报错', crash === null, crash || '');
  ok('游戏能走到有人赢（结果弹窗弹出）', sawResult);
  // 随机局可能几步就赢了，骰子点数不一定凑得齐 6 种，这里只要求「摇过好几次、每次都合法」；
  // 六面点数的完整覆盖由 test.html 的 1800 局模拟负责
  ok('摇骰子显示过合法的 1~6 点', diceValues.size >= 2 && Array.from(diceValues).every(v => v >= 1 && v <= 6),
    Array.from(diceValues).sort().join(','));
  ok('提示条会随着游戏更新', page.el('banner-text').textContent !== before || sawResult, page.el('banner-text').textContent);
  ok('按空格的次数在合理范围内（' + presses + ' 次）', presses > 3 && presses < 600);
  ok('随机局里弹出的卡牌弹窗都处理完了（' + cardPrompts + ' 次弹出，' + cardHandled + ' 次处理完）',
    cardPrompts === cardHandled);

  if (sawResult) {
    ok('结果标题写出了获胜者', /获胜/.test(page.el('result-title').textContent), page.el('result-title').textContent);
    eq('结果面板有 6 个统计格', page.el('result-stats').querySelectorAll('.stat-box').length, 6);
    ok('结果面板列出了所有玩家的进度', page.el('result-rank').textContent.split('　').length === 2, page.el('result-rank').textContent);
    ok('结束后摇骰子按钮被禁用', page.el('roll-btn').disabled);
    const rec = page.localStorage.getItem('adventureRecords');
    ok('获胜成绩写进了本地存档', !!rec && !!JSON.parse(rec).easy, String(rec));
    const stats = page.el('result-stats').textContent;
    ok('统计里有回合数和用时', stats.includes('轮') && stats.includes('秒'), stats);

    page.el('result-again').click();
    ok('点「再来一局」会重新加载本页', page.location.reloaded === true);
    page.el('result-home').click();
    eq('点「换难度」回到首页', page.location.href, './index.html');
  }

  eq('JS 想要的元素 id 在 HTML 里都存在', page.missingIds.length, 0);
  ok('没有向不存在的 id 取元素', page.missingIds.length === 0, page.missingIds.join(','));

  page.cleanup();
  return { presses, cardPrompts };
}

/* ============ 一之二、剧本化对局：卡牌弹窗的两个分支 ============
 * 简单棋盘 easy = S F C B R / Z C f H R / ...
 * 剧本点数（只喂给引擎的 rollDice）：兔子 3 → 退 2；小鸡 1…；兔子 1 → 拿卡；
 * 小鸡 1 → 再扔、1 → 被冻；兔子 6 → 正好踩到第 8 格「回到起点」，手里有 1 张卡。 */
const CARD_SCRIPT = [0.34, 0, 0, 0, 0, 0.999];

async function runToCardPrompt(page) {
  for (let i = 0; i < 24; i++) {
    const state = await settle(page);
    if (state.result) return false;
    if (state.card) return true; // 已经在等我们决定了，不能再按空格（空格等于「用卡牌」）
    pressSpace(page);
    const after = await settle(page);
    if (after.result) return false;
    if (after.card) return true;
  }
  return false;
}

async function testCardBranches() {
  for (const choice of ['use', 'skip', 'space']) {
    const page = loadPage('game.html', { search: '?size=easy&players=rabbit,chick', scriptedRandom: CARD_SCRIPT });
    ok(`卡牌分支（${choice}）：脚本加载无异常`, page.errors.length === 0, page.errors.join('；'));
    const prompted = await runToCardPrompt(page);
    ok(`按剧本走会踩到「回到起点」并弹出卡牌询问（${choice}）`, prompted, page.el('banner-text').textContent);
    if (!prompted) { page.cleanup(); continue; }

    ok('弹窗里说清楚了要用卡牌抵消',
      page.el('card-modal-text').textContent.includes('卡牌'), page.el('card-modal-text').textContent);
    ok('弹窗出现时摇骰子按钮被禁用', page.el('roll-btn').disabled === true);
    eq('弹窗前手上有 1 张卡', page.el('player-panel').querySelectorAll('.pc-cards')[0].textContent, '🎁 1');
    eq('被冻住的小鸡在面板上有标记', page.el('player-panel').querySelectorAll('.pc-frozen')[1].textContent, '❄️ 2');

    if (choice === 'space') pressSpace(page);
    else page.el(choice === 'use' ? 'card-use-btn' : 'card-skip-btn').click();
    await settle(page);
    ok('决定完了弹窗就关掉了', !page.visible('card-modal'));
    /* 提示条会被后面的事件覆盖，所以查它写过的全部文字 */
    const said = (page.el('banner-text')._history || []).join(' | ');
    const pos = page.el('player-panel').querySelectorAll('.pc-pos')[0].textContent;
    const cards = page.el('player-panel').querySelectorAll('.pc-cards')[0].textContent;
    if (choice !== 'skip') {
      ok(`选「用卡牌」（${choice}）：提示写着留在原地`, said.includes('留在原地'), said);
      eq('用掉之后卡牌清零', cards, '🎁 0');
      eq('位置还是第 8 格', pos, '第 8 格');
    } else {
      ok('选「不用」：提示写着被吹回起点', said.includes('被吹回起点'), said);
      eq('不用卡牌就还留着', cards, '🎁 1');
      eq('位置回到第 0 格', pos, '第 0 格');
    }
    /* 小鸡被冻住 2 轮，所以这轮轮到它也被跳过，最后又回到兔子 */
    eq('被冻住的小鸡跳过了一次（❄️ 剩 1）',
      page.el('player-panel').querySelectorAll('.pc-frozen')[1].textContent, '❄️ 1');
    ok('跳过冻住的人之后轮到能行动的兔子', page.el('turn-badge').textContent.includes('兔子'), page.el('turn-badge').textContent);

    page.cleanup();
  }
}

/* ==================== 二、棋盘大小 / 缩放 ==================== */

function testBoardSizing() {
  const page = loadPage('game.html', { search: '?size=hard&players=rabbit,snowleopard,tibetanfox,chick' });
  ok('复杂棋盘脚本加载无异常', page.errors.length === 0, page.errors.join('；'));
  const board = page.el('board');
  const tiles = board.querySelectorAll('.tile');
  eq('复杂棋盘画出 81 个格子', tiles.length, 81);

  const tile = parseFloat(board.style.getPropertyValue('--tile-size'));
  ok('复杂棋盘格子也不小于 62px（' + tile + 'px）', tile >= 62, String(tile));
  ok('复杂棋盘仍然显示格子文字（没有变 dense）', !board._classes.has('dense'), Array.from(board._classes).join(','));
  ok('每格都保留了可读的说明文字',
    tiles.every(t => t.querySelector('.tile-label').textContent.length > 0));

  /* 棋盘确实按 格子×行列 + 间隙 + 内边距 算出来 */
  const width = parseFloat(board.style.width);
  const expected = tile * 9 + 8 * 3 + 12;
  ok('棋盘宽度 = 格子×9 + 间隙 + 内边距（' + width + ' ≈ ' + expected + '）',
    Math.abs(width - expected) < 2, String(width));

  /* 装不下时要给出提示，装了就不提示 */
  page.el('zoom-in').click();
  const bigger = parseFloat(board.style.getPropertyValue('--tile-size'));
  ok('点 🔍＋ 格子会变大（' + tile + ' → ' + bigger + '）', bigger > tile, String(bigger));
  ok('放大到装不下时出现滚动提示', page.visible('board-hint'), page.el('board-hint').className);

  page.el('zoom-out').click();
  const backTile = parseFloat(board.style.getPropertyValue('--tile-size'));
  ok('点 🔍－ 会缩回去（' + bigger + ' → ' + backTile + '）', backTile < bigger, String(backTile));

  /* 一路缩到下限：不会继续变小，装得下就把滚动提示收起来 */
  for (let i = 0; i < 6; i++) page.el('zoom-out').click();
  const minTile = parseFloat(board.style.getPropertyValue('--tile-size'));
  eq('连点缩小会停在下限 62px', minTile, 62);
  ok('缩到看得全时滚动提示收起来了', !page.visible('board-hint'), page.el('board-hint').className);
  ok('缩到下限仍然显示格子文字', !board._classes.has('dense'));

  eq('JS 想要的元素 id 在 HTML 里都存在', page.missingIds.length, 0);
  page.cleanup();
}

/* ==================== 三、首页 index.html ==================== */

function testHomePage() {
  const page = loadPage('index.html', { storage: { adventureRecords: JSON.stringify({ easy: { rounds: 9, seconds: 42, players: 2, winner: 'rabbit', date: '2026-03-20' } }) } });
  ok('index.html 脚本加载无异常', page.errors.length === 0, page.errors.join('；'));

  const sizeCards = page.el('size-options').querySelectorAll('.pick-card');
  const animalCards = page.el('animal-options').querySelectorAll('.pick-card');
  eq('首页列出 3 个难度', sizeCards.length, 3);
  eq('首页列出 4 只小动物', animalCards.length, 4);
  eq('规则讲清楚了', page.el('rules-list').querySelectorAll('li').length, page.exports.RULES.length);
  eq('图例列出了所有格子类型', page.el('rules-legend').querySelectorAll('.legend-item').length, Object.keys(page.exports.TILE_META).length);

  ok('默认选中简单难度', sizeCards[0]._classes.has('selected'));
  eq('默认选中 2 只动物', animalCards.filter(c => c._classes.has('selected')).length, 2);
  ok('提示里写了出牌顺序', page.el('select-hint').textContent.includes('出牌顺序'), page.el('select-hint').textContent);
  ok('读到了上次的成绩', page.el('record-list').textContent.includes('9 轮'), page.el('record-list').textContent.trim());

  /* 换难度 */
  sizeCards[1].click();
  ok('点一下能换成中等难度',
    page.el('size-options').querySelectorAll('.pick-card')[1]._classes.has('selected') &&
    page.el('select-hint').textContent.includes('中等'), page.el('select-hint').textContent);

  /* 加人、减人 */
  animalCards[2].click();
  ok('再点一只动物就变成 3 人', page.el('select-hint').textContent.includes('3 位选手'), page.el('select-hint').textContent);
  ok('3 人时开始按钮可以点', page.el('start-btn').disabled === false);
  page.el('animal-options').querySelectorAll('.pick-card')[2].click();
  page.el('animal-options').querySelectorAll('.pick-card')[1].click();
  ok('只留 1 人时开始按钮被禁用', page.el('start-btn').disabled === true, page.el('select-hint').textContent);
  ok('提示要求至少 2 只', page.el('select-hint').textContent.includes('至少'), page.el('select-hint').textContent);

  /* 人不够时点开始没有反应 */
  const before = page.location.href;
  page.el('start-btn').click();
  eq('人不够时点开始不会跳走', page.location.href, before);

  /* 选好 3 人再开始 */
  page.el('animal-options').querySelectorAll('.pick-card')[1].click();
  page.el('animal-options').querySelectorAll('.pick-card')[3].click();
  page.el('start-btn').click();
  ok('开始游戏会跳到对局页并带上参数',
    page.location.href.startsWith('./game.html?size=medium&players=') &&
    decodeURIComponent(page.location.href).includes('rabbit'), page.location.href);
  const saved = JSON.parse(page.localStorage.getItem('adventureLastSetup') || 'null');
  ok('开始前把选择记了下来（下次打开还记得）', !!saved && saved.size === 'medium' && saved.animals.length === 3, JSON.stringify(saved));

  /* 清空纪录 */
  page.el('clear-records').click();
  eq('清空纪录会把存档一起删掉', page.localStorage.getItem('adventureRecords'), null);
  ok('清空后界面刷新成「还没有记录」', page.el('record-list').textContent.includes('还没有记录'), page.el('record-list').textContent.trim());

  eq('JS 想要的元素 id 在 HTML 里都存在', page.missingIds.length, 0);
  ok('没有向不存在的 id 取元素', page.missingIds.length === 0, page.missingIds.join(','));
  page.cleanup();
}

/* ==================== 三、自检页 test.html ==================== */

function testSelfCheckPage() {
  const page = loadPage('test.html');
  ok('test.html 脚本加载无异常', page.errors.length === 0, page.errors.join('；'));
  const result = page.sandbox.window.__TEST_RESULT__;
  ok('自检页真的跑出了结果', !!result, JSON.stringify(result || null));
  if (!result) { page.cleanup(); return; }
  eq('自检页里失败项为 0', result.fail, 0);
  ok('自检页的检查项足够多（' + result.pass + ' 项）', result.pass > 60, String(result.pass));
  eq('自检页模拟了 1800 局', result.games, 1800);
  ok('汇总显示全部通过', page.el('summary').textContent.includes('全部通过'), page.el('summary').textContent);
  ok('统计行写明了模拟局数', page.el('stats').textContent.includes('1800'), page.el('stats').textContent.slice(0, 80));
  if (result.fails && result.fails.length) console.log('   自检页失败明细：\n   - ' + result.fails.join('\n   - '));
  page.cleanup();
}

/* ==================== 跑起来 ==================== */

(async function main() {
  console.log('骰子大冒险 · 冒烟测试（迷你 DOM，无浏览器）\n');

  console.log('一、对局页 game.html');
  const g = await testGamePage();
  console.log(`   一局按了 ${g.presses} 次空格，卡牌询问 ${g.cardPrompts} 次`);
  await testCardBranches();
  console.log('   卡牌弹窗：点按钮 / 按空格 三条路都走通了\n');

  console.log('二、棋盘大小与缩放（复杂棋盘也要看得清）');
  testBoardSizing();
  console.log('  9×9 格子不小于 62px，放大/缩小都正常\n');

  console.log('三、首页 index.html');
  testHomePage();
  console.log('   选难度 / 选动物 / 开始 / 清纪录 都正常\n');

  console.log('四、自检页 test.html');
  testSelfCheckPage();
  console.log('');

  if (failures.length) {
    console.log('❌ 通过 ' + pass + ' 项，失败 ' + failures.length + ' 项：');
    failures.forEach(f => console.log('   - ' + f));
    process.exitCode = 1;
  } else {
    console.log('✅ 全部通过：' + pass + ' 项检查都没问题');
  }
})().catch(err => {
  console.error('冒烟测试本身出错：', err);
  process.exitCode = 2;
});
