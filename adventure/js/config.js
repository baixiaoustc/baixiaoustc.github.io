/* ============================================================
 * 骰子大冒险 · 静态配置（纯数据，不碰 DOM）
 * 棋盘走法：蛇形（第 1 行从左到右，第 2 行从右到左，依此类推）
 * 格子代号见 TILE_CODES，布局字符串每行长度 = 列数，行数 = 行数
 * ============================================================ */

/* 三种棋盘：简单 / 中等 / 复杂 */
const SIZES = {
  easy:   { key: 'easy',   label: '简单', rows: 4, cols: 5, emoji: '🐣', desc: '4 × 5 棋盘 · 20 格', hint: '第一次玩就选这个' },
  medium: { key: 'medium', label: '中等', rows: 5, cols: 6, emoji: '🐰', desc: '5 × 6 棋盘 · 30 格', hint: '认得路以后来挑战' },
  hard:   { key: 'hard',   label: '复杂', rows: 9, cols: 9, emoji: '🦁', desc: '9 × 9 棋盘 · 81 格', hint: '又长又刺激，小心回到起点' }
};

/* 布局：S 起点 · E 终点 · C 卡牌 · H 回到起点 · R 再扔一次
 *       Z 冻结2轮 · F 前进2步 · f 前进3步 · B 后退2步 · b 后退3步 */
const LAYOUTS = {
  easy: [
    'SFCBR',
    'ZCfHR',
    'BCZFR',
    'BCfZE'
  ],
  medium: [
    'SFCBRZ',
    'CfBHRC',
    'FBZCRF',
    'HCfZRB',
    'CFZfRE'
  ],
  hard: [
    'SFCBRZfCB',
    'HRCFBZCfR',
    'CBFRZHCFb',
    'RCZfBCRFZ',
    'BCHFRZCbf',
    'RCFBZCRFB',
    'ZCfHRBCFZ',
    'CRFbZCFRB',
    'CfZRBCFRE'
  ]
};

/* 冻结格冻结几轮（引擎与文案都以这个常量为准，别再写死数字） */
const FREEZE_TURNS = 2;

const TILE_CODES = {
  S: { type: 'start' },
  E: { type: 'goal' },
  C: { type: 'card' },
  H: { type: 'home' },
  R: { type: 'again' },
  Z: { type: 'freeze', turns: FREEZE_TURNS },
  F: { type: 'forward', steps: 2 },
  f: { type: 'forward', steps: 3 },
  B: { type: 'back', steps: 2 },
  b: { type: 'back', steps: 3 }
};

/* 每种格子的外观与说明 */
const TILE_META = {
  start:   { icon: '🏁', label: '起点',     color: '#51cf66', note: '出发点，安全区' },
  goal:    { icon: '🏆', label: '终点',     color: '#ffd43b', note: '谁先到这里谁赢' },
  card:    { icon: '🎁', label: '获得卡牌', color: '#4dabf7', note: '拿到 1 张卡牌，可以抵消一次「回到起点」' },
  home:    { icon: '🌀', label: '回到起点', color: '#9775fa', note: '被吹回起点（有卡牌可以抵消）' },
  forward: { icon: '➡️', label: '前进',     color: '#20c997', note: '从这一格再往前送几步' },
  back:    { icon: '⬅️', label: '后退',     color: '#ff922b', note: '从这一格往回退几步' },
  again:   { icon: '🎲', label: '再扔一次', color: '#fcc419', note: '运气不错，马上还能再摇一次' },
  freeze:  { icon: '❄️', label: '冻结2轮',  color: '#74c0fc', note: '接下来 2 次轮到你都跳过' }
};

/* 四种小动物形象 = 四个玩家位 */
const ANIMALS = {
  rabbit:      { id: 'rabbit',      name: '兔子', icon: '🐰', color: '#ff8fab' },
  snowleopard: { id: 'snowleopard', name: '雪豹', icon: '🐆', color: '#4dabf7' },
  tibetanfox:  { id: 'tibetanfox',  name: '藏狐', icon: '🦊', color: '#ff922b' },
  chick:       { id: 'chick',       name: '小鸡', icon: '🐤', color: '#fcc419' }
};

/* 固定轮转顺序，和小朋友选了几只无关，保证前后一致 */
const ANIMAL_ORDER = ['rabbit', 'snowleopard', 'tibetanfox', 'chick'];

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

/* 规则文案（首页与对局页共用） */
const RULES = [
  '轮到谁，谁就按一下「空格」摇骰子（也可以直接点骰子按钮）。',
  '摇出几点，小动物就往前跳几格，一格一格地走。',
  '走到哪一格，就触发哪一格的效果；被「前进 / 后退」送到的新格子不再触发效果，免得连锁停不下来。',
  '🎁 卡牌：拿到 1 张，走到「回到起点」时可以拿出来抵消一次。',
  `❄️ 冻结 ${FREEZE_TURNS} 轮：接下来 ${FREEZE_TURNS} 次轮到你的机会直接跳过。`,
  '🎲 再扔一次：这一轮你还能再摇一次骰子。',
  '🏆 谁先走到终点谁赢；骰子点数超过终点也算到达。'
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SIZES, LAYOUTS, TILE_CODES, TILE_META, ANIMALS, ANIMAL_ORDER, MIN_PLAYERS, MAX_PLAYERS, FREEZE_TURNS, RULES };
}
