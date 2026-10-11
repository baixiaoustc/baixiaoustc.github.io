# 小游戏问题清单

记录日期：2026-07-05
范围：`snake/`（贪吃蛇）、`pinyin/`（打字机）
说明：本文件在 `_config.yml` 的 `exclude` 中，不会被 Jekyll 发布到站点。

状态标记：`待修` / `已修` / `不修`（不修需注明理由）

严重度：P0 影响正常游玩 · P1 明显体验缺陷 · P2 打磨项 · P3 卫生问题（隐私/权限/杂物）

---

## 一、贪吃蛇 `snake/index.html`

### SNK-1 · P0 · 撞到尾巴误判死亡
- 位置：`snake/index.html:447-452`（碰撞检测）、`snake/index.html:461`（`snake.pop()`）
- 现象：沿身体贴边转向、头部正好进入尾巴当前所在格时，直接「游戏结束」，但这一帧尾巴本该让开。
- 原因：碰撞循环遍历了整个 `snake` 数组，包含即将被 `pop()` 掉的尾节点。
- 建议：判定时跳过尾节点（仅在未吃到食物时才可忽略），例如遍历 `snake.slice(0, snake.length - 1)`，并把「是否吃到食物」作为是否保留尾节点的条件。
- 状态：待修

### SNK-2 · P1 · 暂停没有任何反馈
- 位置：`snake/index.html:492-495`（`pauseGame`）、`snake/index.html:488-489`（按钮状态）
- 现象：按空格暂停后画面静止、无提示，按钮仍显示「游戏中」且为 disabled；手机端「开始/暂停」按钮点了也看不出是否生效。
- 原因：`pauseGame` 只翻转 `isPaused`，没有更新任何 UI。
- 建议：暂停时在画布上叠加「已暂停」遮罩/文字，并把按钮文案改为「继续」，同时解除 disabled 或提供桌面端暂停按钮。
- 状态：待修

### SNK-3 · P2 · 切换速度会重置节拍
- 位置：`snake/index.html:505-511`
- 现象：每次按 1/2/3 都 `clearInterval` + 重新 `setInterval`，等于白送一个完整心跳，快速连按可让蛇加速。
- 原因：用重建定时器的方式应用新速度。
- 建议：记录上一次 tick 时间戳，改为在同一个循环里按累计时间判断是否该走一步。
- 状态：待修

### SNK-4 · P2 · 「浅色」背景对画布无效
- 位置：`snake/index.html:605-633`（`setBgStyle`）、`snake/index.html:352-353`（`draw` 固定填充 `#1a1a2e`）
- 现象：切到浅色主题后，只有画布外的页面底色变浅，画布仍是深色，观感割裂；网格色 `#2a2a3e` 同理写死。
- 建议：把画布底色与网格色也纳入主题变量，`draw()` 时按当前主题取值。
- 状态：待修

### SNK-5 · P2 · 没有最高分记录
- 位置：全局（`snake/index.html` 未使用 localStorage）
- 现象：刷新页面即清零，小朋友无法比较进步；对比打字机已有本地存档。
- 建议：复用 `pinyin/js/storage.js` 的思路，存 `snakeBestScore`，结束时展示「最高分」。
- 状态：待修

### SNK-6 · P3 · 页面暴露真实姓名
- 位置：`snake/index.html:8`（`<title>`）、`snake/index.html:243`（`<h1>`）
- 现象：公开站点的标题与首屏大标题含小朋友真实姓名「白玉如」，页面背景还是其真实照片。
- 建议：改为昵称或游戏名（如「小蛇大冒险」），照片文件名也建议脱敏；如需保留个性化文案，改成仅本机可见或加访问码。
- 状态：待修（需与家长确认口径）

### SNK-7 · P3 · 文件权限与其他站点文件不一致
- 位置：`snake/`（目录 700）、`snake/index.html` 与背景 jpg（600）
- 现象：站点其余文件为 644 / 755。Git 部署不受影响，但若以工作区为根目录、用其他系统用户（如 nginx）直接提供文件会读不到。
- 建议：`chmod 755 snake && chmod 644 snake/*`。
- 状态：待修

---

## 二、打字机 `pinyin/`

### PYN-1 · P1 · 题池少于 20 题时会白屏（潜在）
- 位置：`pinyin/js/practice.js:1`（`ROUND_SIZE = 20`）、`:41-58`（`pickQuestions`）、`:85-99`（`loadQuestion`）、`:198`（轮次判定）
- 现象：`pickQuestions` 在题池不足时只返回更少的题，但进度条与结束判定硬编码 20；真发生时 `questions[currentIndex]` 为 `undefined`，`loadQuestion()` 抛错白屏。
- 现状：三档词库分别 57 / 54 / 59 条，暂不触发，属埋雷。
- 建议：把 `ROUND_SIZE` 改为 `Math.min(ROUND_SIZE, pool.length)`，或在 `init()` 里校验题量并在不足时降级。
- 状态：待修

### PYN-2 · P2 · 用时包含过场动画
- 位置：`pinyin/js/practice.js:189-225`
- 现象：正确后等 0.7s、错误后等 1.6s 才进下一题，这段等待被计入本轮用时，成绩页的「用时」偏长。
- 建议：暂停计时器（或累计 `transitionMs` 后从总时长里扣除）。
- 状态：待修

### PYN-3 · P2 · 自检页会写真实统计数据
- 位置：`pinyin/test.html:35-53`
- 现象：自检直接往玩家真实的 `pinyinStats` 写入测试记录，再手工回滚计数；中途关页面或回滚逻辑与真实记录不一致时，会留下脏数据甚至出现负数。
- 建议：自检改用独立的 storage key（如 `pinyinStatsSelfTest`），或先备份整个 JSON、结束时整体还原。
- 状态：待修

### PYN-4 · P3 · 空目录与杂物
- 位置：`pinyin/assets/`（空）、根目录 `dd7e7cf42b1987d98164c334320dd746.txt`（40 字节十六进制串，疑为平台校验文件）
- 建议：确认无引用后删掉空目录；校验文件若属平台所需则加注释说明，否则清理。
- 状态：待修

---

## 三、遗留观察（不单列问题，供后续设计参考）

- 打字机的错题处理是「答错即跳过」，不给重试机会（`practice.js:206-225`）。对练手速是合理设计，但对小朋友偏严厉，第三个游戏若要复用这套反馈，可考虑「允许重试一次」。
- 打字机与贪吃蛇都没有「音效」和「可分享成绩」，是两个可以低成本提升趣味的方向。
- 两个游戏代码风格不统一（贪吃蛇单文件内联，打字机模块化拆分）。第三个游戏建议直接按打字机的模块化风格起步，便于继续维护。

## 四、第三个游戏「🎲 骰子大冒险」（`/adventure/`）

- 代号：adventure（方格棋盘·摇骰子走格子，2~4 人同屏轮流玩）
- 结构：`index.html`（选难度/选动物/看纪录）、`game.html`（对局）、`test.html`（自检）、`js/{config,engine,storage,ui,setup,game}.js`、`css/style.css`
- 规则要点：单颗骰子 1~6；走到哪格算哪格（超过终点也算到达）；踩到效果格立即生效；前进/后退落到的格子不再连锁触发；卡牌可抵消一次「回起点」，不设上限；「冻结 2 轮」= 接下来两次轮到你都跳过；「再扔一次」仍是同一个人的回合；谁先到终点谁赢。
- 验证：`node docs/adv-smoke.js`（迷你 DOM 冒烟测试，112 项检查）＋ `adventure/test.html`（浏览器自检，1800 局模拟 + 逐条规则检查）。

### ADV-1 · P0 · 卡牌「用掉」按钮完全失效
- 位置：`adventure/js/ui.js:110`（`fire()` 不转发参数）、`:116`（`fire('onCardChoice', choice)`）
- 现象：`fire` 只写 `opts[name]()`，`choice` 被丢掉，`resumeTurn(state, undefined)` 一律走「不用卡牌」分支。结果点「用掉卡牌」也会被吹回起点、卡牌也消耗不掉，即卡牌功能 100% 失效（游戏核心玩法之一）。
- 修法：`function fire(name, ...args) { ...opts[name](...args); }`。
- 状态：已修（冒烟测试的剧本化对局覆盖「点用 / 点不用 / 按空格」三条路径）

### ADV-2 · P2 · 文件与目录权限漂移
- 现象：新建的 `adventure/` 及子目录落在 `700`，文件落在 `600`，与仓库其余部分（目录 755 / 文件 644）不一致。
- 状态：已修（`chmod 755 adventure adventure/js adventure/css`、`chmod 644 adventure/*.html adventure/css/style.css adventure/js/*.js adventure/test.html`）

### ADV-3 · P3 · 游戏名与访问路径未与家长确认
- 位置：`_includes/header.html`（下拉项）、`README.md`、`adventure/`（目录名）
- 说明：为避免「大富翁」商标问题，暂定名「🎲 骰子大冒险」，路径 `/adventure/`。名字/路径一旦上线再改会带走外链，建议先确认。
- 状态：已定（用户确认：名称「🎲 骰子大冒险」、路径 `/adventure/`，未再改动）

### ADV-4 · P3 · 无浏览器端可用的自动化验证
- 说明：本机 headless Chrome 起不来（`Failed to create socket directory` 于 profile 目录），所以改用 `docs/adv-smoke.js`（自写迷你 DOM + `node:vm`）驱动真实的页面脚本。它覆盖不到真实排版/样式，`--tile-size`、`#pieces` 绝对定位叠在 `#board` 里这类布局约束只能靠人工看一眼。
- 建议：改动 UI 后人工开一次 `/adventure/`，三个难度各看一眼格子与棋子位置。
- 状态：观察（工具已就位，不再依赖 Chrome；棋盘尺寸已有数值断言，但「好不好看」仍须人工看）

### ADV-5 · P1 · 复杂棋盘（9×9）格子太小看不清
- 位置：`adventure/js/ui.js`（`sizeBoard()`）、`adventure/css/style.css`（`.board-wrap` / `.tile-icon` / `.tile-label`）
- 现象：旧算法把棋盘宽度写死不超过 720px，再用 `innerHeight - 320` 反推高度；在 1280×800 这类常见窗口里 9×9 只能拿到约 53px 一格，而且 `cols > 6` 就直接加 `.dense` 把每格的说明文字（前进/后退/卡牌/回起点…）全部藏掉，只剩一个小图标 —— 用户反馈「格子太小了，看不清」。
- 修法：
  1. 格子尺寸设下限 `MIN_TILE = 62px`、上限 `MAX_TILE = 132px`，并按 `.board-wrap` 的真实位置（`getBoundingClientRect().top`）算可用高度，不再用固定 320px 的估算；
  2. 装不下时 `.board-wrap` 改为 `overflow: auto` 可滚动，并显示「棋盘比屏幕大，可以滚动查看」提示；
  3. 顶栏加 `🔍－ / 🔍＋` 两档缩放（0.75×~2×），棋盘整体跟着格子变大变小；
  4. 是否藏文字改成看格子实际大小（`< 58px` 才 dense），不再只看列数；图标/文字用 `max(固定px, 百分比)` 兜底，格子再小也读得出来；
  5. 3~4 人挤在同一格时棋子缩到格子的 50%，别把格子上的字挡严实。
- 效果（按公式推算）：1440×900 → 9×9 每格 70.5px；1280×800 → 62px 并出现滚动提示；三档难度都保留格子文字。
- 状态：已修（`docs/adv-smoke.js` 新增「棋盘大小与缩放」一组检查：81 格、≥62px、不 dense、宽度=格子×9+间隙、缩放上下限、滚动提示收放）


### ADV-6 · P1 · 四个玩家里只有雪豹不是「一个头」
- 位置：`adventure/js/config.js`（`ANIMALS.snowleopard.icon`）、`adventure/js/ui.js`（棋子 `:180`、玩家卡片 `:291`、提示条 `setBanner :372`、回合徽章 `:379`、按空格提示 `:391`、结算 `:550`/`:583`）、`adventure/js/setup.js`（选动物卡片 `:67`、纪录 `:133`、出牌顺序 `:162`）
- 现象：兔子 🐰 / 藏狐 🦊 / 小鸡 🐤 的 emoji 本身就是一个头，而雪豹只能用 🐆 —— 它是**全身像**（画出来的墨迹只占 35.0%，另三只是 47.1%~62.1%），摆在棋盘格子上又瘦又高，和另外三只完全不是一套形象；用户反馈「4 个玩家的 logo，只有雪豹是全身形象」。
- 说明：系统 emoji 里**没有**灰白色的猫科「头」可以直接借（🐯 是橙色老虎、🐱 是橘猫、🐻‍❄️ 是北极熊，都试过量了尺寸/颜色），所以雪豹头像是自己画的矢量图 `adventure/img/snowleopard.svg`（100×100、29 个图元、耳朵+脸+7 个斑+绿眼睛+白吻部，只用手绘填色，任何系统上长得都一样）。
- 修法：
  1. 新增 `adventure/js/avatar.js`（`AdventureAvatar`）：`node(id, cls)` 把「有 `avatar` 图片」的小动物变成 `<img class="avatar-img">`（没配图片的仍旧输出 emoji），`setText(el, text)` 把文案里的雪豹 emoji 就地换成 `<img class="avatar-inline">`；图片加载失败自动退回 🐆，不会留一块空白；
  2. `config.js` 给 `snowleopard` 加 `avatar: './img/snowleopard.svg'`（emoji 仍保留做兜底）；
  3. 上面 10 处 `textContent = icon` 全部改走 `AdventureAvatar`，两个页面的 `<script>` 顺序都插在 config 之后、ui/setup 之前；
  4. `style.css` 加 `.avatar-img` 与四档尺寸（选卡片 34px / 玩家卡片 26px / 棋子 86% / 行内 1.15em）。
- 自检：`python3 docs/adv-avatar-preview.py` 用 PIL 量雪豹头像——左右对称（平均差 0.68/255）、墨迹 44.1%（与三张 emoji 脸同一量级）、缩到 32px / 24px 仍有 14 / 6 个深色特征像素；`node docs/adv-smoke.js` 新增「雪豹头像」一组 21 项断言（首页卡片、棋子、玩家卡片、提示条是图片；兔子/藏狐/小鸡仍是 emoji；棋盘格子 emoji 未被误换；图挂了退回 emoji）。
- 状态：已修（艺术风格仍须家长/小朋友看一眼，`adventure/js/config.js` 里删掉 `avatar` 一行即可整体退回 🐆）
