/* ============================================================
 * 骰子大冒险 · 纯逻辑引擎
 * 不碰 DOM、不读时间，只接收状态对象与随机源，返回「事件列表」；
 * 界面层照着事件列表播动画即可。因此这个文件能在 Node 里批量模拟对局。
 * ============================================================ */

/* 摇一颗 1~6 的骰子；rng 可注入，便于测试 */
function rollDice(rng) {
  const r = typeof rng === 'function' ? rng : Math.random;
  return 1 + Math.floor(r() * 6);
}

/* 按难度生成棋盘：蛇形路径 + 每格的类型 */
function buildBoard(sizeKey) {
  const size = SIZES[sizeKey];
  if (!size) throw new Error('未知难度：' + sizeKey);
  const layout = LAYOUTS[sizeKey];
  if (!layout || layout.length !== size.rows) {
    throw new Error(`难度 ${sizeKey} 的布局应有 ${size.rows} 行，实际 ${layout ? layout.length : 0}`);
  }

  const tiles = [];
  let index = 0;
  for (let r = 0; r < size.rows; r++) {
    const row = layout[r];
    if (row.length !== size.cols) {
      throw new Error(`难度 ${sizeKey} 第 ${r + 1} 行应有 ${size.cols} 格，实际 ${row.length}`);
    }
    for (let i = 0; i < size.cols; i++) {
      const code = row[i];
      const mapping = TILE_CODES[code];
      if (!mapping) throw new Error(`难度 ${sizeKey} 出现未知格子代号「${code}」`);
      const meta = TILE_META[mapping.type];
      const steps = mapping.steps || 0;
      tiles.push({
        index,
        row: r,
        col: r % 2 === 0 ? i : size.cols - 1 - i, // 蛇形：奇数行从右往左
        pathOrder: i,
        type: mapping.type,
        steps,
        turns: mapping.turns || 0,
        icon: meta.icon,
        color: meta.color,
        label: (mapping.type === 'forward' || mapping.type === 'back')
          ? `${meta.label}${steps}步`
          : meta.label
      });
      index++;
    }
  }

  if (tiles[0].type !== 'start') throw new Error('第一格应该是起点 🏁');
  if (tiles[tiles.length - 1].type !== 'goal') throw new Error('最后一格应该是终点 🏆');

  return { sizeKey, rows: size.rows, cols: size.cols, tiles, goalIndex: tiles.length - 1 };
}

/* 开一局：state 是可以整体序列化的普通对象 */
function createGame(opts) {
  const sizeKey = opts.sizeKey;
  const board = buildBoard(sizeKey);
  const ids = (opts.animalIds || []).slice(0, MAX_PLAYERS);
  if (ids.length < MIN_PLAYERS) throw new Error(`至少要 ${MIN_PLAYERS} 只小动物参赛`);

  const players = ids.map((id, seat) => {
    const a = ANIMALS[id];
    if (!a) throw new Error('未知动物：' + id);
    return {
      id, seat, name: a.name, icon: a.icon, color: a.color,
      pos: 0,        // 所在格子的路径序号
      frozen: 0,     // 还剩几轮被冻住
      cards: 0,      // 手上的卡牌数
      rolls: 0,      // 摇骰子次数
      steps: 0,      // 总共走了多少格（含前进/后退）
      skips: 0,      // 被跳过几次
      homeCount: 0,  // 被送回起点几次
      usedCards: 0   // 用掉几张卡牌
    };
  });

  return {
    sizeKey, board, players,
    turn: 0,
    round: 1,
    phase: 'idle',   // idle | moving | awaiting | over
    dice: 0,
    winner: null,
    pending: null    // 卡牌询问挂起：{ kind: 'card', player }
  };
}

function currentPlayer(state) {
  return state.players[state.turn];
}

function playerById(state, id) {
  return state.players.find(p => p.id === id) || null;
}

function advanceTurn(state) {
  state.turn = (state.turn + 1) % state.players.length;
  if (state.turn === 0) state.round += 1;
}

function publicTile(tile) {
  return { index: tile.index, type: tile.type, steps: tile.steps, turns: tile.turns, icon: tile.icon, label: tile.label };
}

/* 轮到某人；如果他被冻住就跳过去，一直找到能行动的人 */
function beginTurn(state) {
  const ev = [];
  // 兜底：常量万一没读到，也不能让循环上限变成 NaN（那会让开局一个事件都不发）
  const freezeTurns = typeof FREEZE_TURNS === 'number' ? FREEZE_TURNS : 2;
  const limit = state.players.length * (freezeTurns + 2) + 8;
  for (let guard = 0; guard < limit; guard++) {
    const p = currentPlayer(state);
    if (p.frozen > 0) {
      p.frozen -= 1;
      p.skips += 1;
      ev.push({ type: 'turnStart', player: p.id, round: state.round, frozen: true });
      ev.push({ type: 'skip', player: p.id, remaining: p.frozen });
      ev.push({ type: 'turnEnd', player: p.id, round: state.round });
      advanceTurn(state);
      continue;
    }
    state.phase = 'idle';
    ev.push({ type: 'turnStart', player: p.id, round: state.round });
    return ev;
  }
  state.phase = 'idle';
  return ev;
}

/* 开局：只确定第一个能行动的人，不自动摇骰子 */
function startGame(state) {
  state.phase = 'idle';
  return beginTurn(state);
}

/* 一次完整行动：摇骰子 → 走格 → 触发格子 → 换人 */
function playTurn(state, rng) {
  if (state.winner || state.pending || state.phase === 'over') return [];
  const ev = [];
  const p = currentPlayer(state);
  const goal = state.board.goalIndex;

  const value = rollDice(rng);
  state.dice = value;
  p.rolls += 1;
  state.phase = 'moving';
  ev.push({ type: 'roll', player: p.id, value });

  let remaining = value;
  while (remaining > 0 && p.pos < goal) {
    p.pos += 1;
    p.steps += 1;
    remaining -= 1;
    ev.push({ type: 'step', player: p.id, to: p.pos });
  }

  if (p.pos >= goal) {
    ev.push(...winGame(state, p));
    return ev;
  }

  const tile = state.board.tiles[p.pos];
  ev.push(...resolveTile(state, p));
  if (state.pending || state.winner) return ev;

  if (tile.type === 'again') {
    state.phase = 'idle';
    ev.push({ type: 'againTurn', player: p.id, round: state.round });
    return ev;
  }

  ev.push(...endTurn(state));
  return ev;
}

/* 结算落点格子；被前进/后退送到的格子不会再触发（约定：不连锁） */
function resolveTile(state, p) {
  const tile = state.board.tiles[p.pos];
  const ev = [{ type: 'land', player: p.id, pos: p.pos, tile: publicTile(tile) }];

  switch (tile.type) {
    case 'card':
      p.cards += 1;
      ev.push({ type: 'gainCard', player: p.id, cards: p.cards });
      break;

    case 'freeze':
      p.frozen = tile.turns > 0 ? tile.turns : (typeof FREEZE_TURNS === 'number' ? FREEZE_TURNS : 2);
      ev.push({ type: 'freeze', player: p.id, turns: p.frozen });
      break;

    case 'again':
      ev.push({ type: 'again', player: p.id });
      break;

    case 'forward': {
      const from = p.pos;
      p.pos = Math.min(from + tile.steps, state.board.goalIndex);
      p.steps += p.pos - from;
      ev.push({ type: 'jump', player: p.id, from, to: p.pos, steps: tile.steps, dir: 'forward' });
      if (p.pos >= state.board.goalIndex) ev.push(...winGame(state, p));
      break;
    }

    case 'back': {
      const from = p.pos;
      p.pos = Math.max(0, from - tile.steps);
      ev.push({ type: 'jump', player: p.id, from, to: p.pos, steps: tile.steps, dir: 'back' });
      break;
    }

    case 'home': {
      if (p.cards > 0) {
        state.pending = { kind: 'card', player: p.id };
        state.phase = 'awaiting';
        ev.push({ type: 'askCard', player: p.id, cards: p.cards });
      } else {
        ev.push(...sendHome(state, p));
      }
      break;
    }

    default:
      break; // 起点 / 终点等没有额外效果
  }
  return ev;
}

/* 界面上问完「用不用卡牌」之后继续这一次行动 */
function resumeTurn(state, choice) {
  if (!state.pending) return [];
  const p = currentPlayer(state);
  state.pending = null;
  const ev = [];

  if (choice === 'use' && p.cards > 0) {
    p.cards -= 1;
    p.usedCards += 1;
    ev.push({ type: 'useCard', player: p.id, cards: p.cards, pos: p.pos });
  } else {
    ev.push(...sendHome(state, p));
  }
  ev.push(...endTurn(state));
  return ev;
}

function sendHome(state, p) {
  const from = p.pos;
  p.pos = 0;
  p.homeCount += 1;
  return [{ type: 'home', player: p.id, from, to: 0 }];
}

function winGame(state, p) {
  state.winner = p.id;
  state.phase = 'over';
  return [{ type: 'win', player: p.id, round: state.round, rolls: p.rolls, steps: p.steps }];
}

function endTurn(state) {
  const p = currentPlayer(state);
  const ev = [{ type: 'turnEnd', player: p.id, round: state.round }];
  advanceTurn(state);
  ev.push(...beginTurn(state));
  return ev;
}

/* Node 里跑模拟时用；浏览器里没有 module，这段会被跳过。
 * 注意：单独 require 本文件时拿不到 config.js 里的常量（SIZES 等），
 * 所以这里只导出函数，常量按存在与否附加。 */
if (typeof module !== 'undefined' && module.exports) {
  const api = { rollDice, buildBoard, createGame, startGame, playTurn, resumeTurn, currentPlayer, playerById, publicTile };
  if (typeof SIZES !== 'undefined') api.SIZES = SIZES;
  if (typeof LAYOUTS !== 'undefined') api.LAYOUTS = LAYOUTS;
  if (typeof TILE_META !== 'undefined') api.TILE_META = TILE_META;
  if (typeof FREEZE_TURNS !== 'undefined') api.FREEZE_TURNS = FREEZE_TURNS;
  module.exports = api;
}
