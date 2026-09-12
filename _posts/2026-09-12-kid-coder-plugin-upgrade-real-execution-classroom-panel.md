---
layout: post
title: "kid-coder 插件改造：从纯教学脚手架到真执行+小教室面板"
date: 2026-09-12 00:00:00 +0800
categories: deepseek harness plugin
tags: DeepSeek Harness kidlab kid-coder Cordis 沙箱 少儿编程 动态插件 Turtle SVG
---
# kid-coder 插件改造：从「纯教学脚手架」到「B 型真执行 + 可折叠小教室面板」

> **核心结论**：kid-coder 从「只讲不跑」升级为「能真跑、还能把图画出来」的插件，补齐了 kidlab 系列拼图的最后一块。考虑到苹果电脑没有容器级沙箱，我们专门搭了一套三重保护，用来安全运行自家小朋友写的代码，并在真机上全部跑通。

## 正文

### 一、背景：kid-coder 是系列里「掉队」的那一个

kidlab 系列四款插件里，后三款都是 **B 型真执行**（models 可直接跑系统命令）+ 带**可折叠常驻前端卡片**：

| 插件 | 类型 | 真执行命令 | 前端卡片 |
|---|---|---|---|
| kid-coder（改造前） | **A 型纯脚手架** | ❌ 无 | ❌ 无 |
| kid-sysmon | B 型 | `system_profiler` 等（只读） | 猫咪体检折页 |
| kid-network | B 型 | `ifconfig / traceroute / dig` 等（只读） | 信鸽邮局 |
| kid-storage | B 型 | `df / du`（只读） | 仓库大管家 |

kid-coder 原本只产出「教学脚手架 + 语气约束」（解释、出题、改作业、拆步骤），让模型去讲。
它**不执行任何代码**——因为一执行就成了「任意代码运行」，这恰恰是系列里唯一一个真正踩到
「macOS 无沙箱」这个坑的插件（其余三款都是只读命令，天然安全）。

**关键洞察**：其余三款插件「只读命令」本身就安全，唯独 kid-coder 一旦真执行就要求真正的运行沙箱——
所以这次改造的核心不是功能，而是**安全模型**。

我们这次改造的结论是：**kid-coder 升级成 B 型真执行，加一个可折叠的小教室面板展示运行结果和图形**，
沙箱用「sandbox-exec 降权 + 资源护栏 + stdlib-only」三层兜底。

### 二、改造后的架构

```
plugin-kid-coder/
├─ src/
│  ├─ index.ts      # 入口：注册 5 个工具（原来 4 个 + 新增 kid_run）
│  ├─ config.ts     # 新增 runTimeoutSec / sandbox 两个运行配置
│  └─ tools.ts      # 新增 kid_run 工具 + sandboxRun() 沙箱执行器
├─ python/          # ★ 新增：前端与模型共用的 Python 运行层
│  ├─ kidturtle.py  # 纯 Python SVG 海龟记录器（注入成 turtle 模块）
│  ├─ kidrunner.py  # 沙箱执行器：跑代码 → 捕获 stdout + 图形 → base64(JSON)
│  └─ kid.profile   # sandbox-exec 降权 profile
├─ cordis/          # ★ 新增：可折叠「小教室」前端
│  ├─ host.js       # RPC kidrun:run：沙箱真跑 + 返回结果
│  ├─ client.js     # 卡片：代码框 + 跑一下 + 输出 + SVG/PNG 内联
│  ├─ precheck.mjs  # 本地验证两个 half 语法
│  └─ activate.md   # 在 harness web 一键激活的提示词
└─ example/         # 配置示例
```

我们有**两条执行通路，共用同一个 `python/` 运行层**：

1. **模型通路（`kid_run` 工具）**：模型在对话里让 kid_run 跑一段代码（验证习题、演示示例），返回「输出文本 + 是否出图」的摘要。走 `src/tools.ts` 的 `sandboxRun()`。
2. **前端通路（小教室卡片）**：小朋友在卡片里写代码、点「跑一下」，卡片就地显示**控制台输出 + 海龟 SVG / matplotlib PNG**。走 `cordis/host.js` 的 `kidrun:run` RPC。

**关键洞察**：模型通路和前端通路共享同一个沙箱运行层，保证「模型示范」和「小朋友自己跑」用的是同一套安全边界，不会出现两套行为不一致。

### 三、核心难点：macOS 没有沙箱，怎么安全跑小朋友的代码

**结论：用三层兜底，只针对「自家小朋友自己写的代码」这种低威胁模型，不是真正的安全边界。**

#### 层 1 · 降权：`sandbox-exec`（macOS 内置的穷人沙箱）

`/usr/bin/sandbox-exec`（Seatbelt，实测可用，macOS 13 Ventura）用一个 profile 在命令执行前限死权限。
`python/kid.profile` 内容：

```
(version 1)
(deny default)
(allow process*)
(allow sysctl-read)
(allow file-read*)
(allow file-write* (subpath "/tmp"))
(allow ipc-posix-shm)
(deny network*)
```

效果：**禁网络、禁写临时目录以外、只读系统库**。实测网络访问被拦（`connect` 抛错）。

#### 层 2 · 护栏：超时 + 隔离模式 + 防注入

- **超时**：macOS 默认**没有 GNU `timeout`**，改用 Python 侧看门狗 `threading.Timer(deadline, ...)`，到点 `os.write(1, base64(json))` 后 `os._exit(42)`。注意一个坑：`os._exit` 不 flush 缓冲，必须用 `os.write` 直写 fd1，否则超时结果会丢。
- **隔离**：`python3 -I`（忽略 site-packages 与环境变量，只留 stdlib），图形用自带记录器。
- **防注入**：源码先 base64 再进 shell 写临时文件（b64 字符集安全，杜绝 shell 注入），不拼接任何用户输入进命令。

#### 层 3 · 封闭环境：只有 stdlib，图形自带

Homebrew 的 python3（3.14）**没有 tkinter、没有 matplotlib、没有 ghostscript** → 原生 `import turtle`
会直接崩（`import _tkinter: No module named`）。所以图形不能靠 GUI 或第三方包，而是**自己写了一个
纯 Python 的 SVG 海龟记录器**。

#### 踩到的坑（已沉淀）

1. **`sandbox-exec` 不认 argv 形式的 env 赋值**：`sandbox-exec -f p KID_DEADLINE=5 python3 ...` 会把
   `KID_DEADLINE=5` 当成要执行的程序名 → `execvp() failed`。我们把 **deadline 作为 kidrunner 的第 2 个
   位置参数传入**，彻底绕开（不能用环境变量前缀）。
2. **超时结果丢失**：`sys.stdout.write` + `os._exit` 因缓冲不 flush 丢输出，改用 `os.write(1, ...)`。
3. **类级目录污染**：第一版把海龟绘制存储写成类属性 `Turtle._catalog`，模块加载时 `_Screen._t` 把海龟
   对象本身 append 进目录，导致迭代时 `'Turtle' object is not subscriptable`。改为**模块级全局 `_G`**，彻底干净。

**关键洞察**：这三个坑都不是「功能没实现」，而是「安全边界下的实现细节」——`os._exit` 不 flush、
`sandbox-exec` 的参数语义、类级状态污染，每一条都只在真沙箱 + 真执行场景下才会暴露。

### 四、图形管线：turtle → SVG / matplotlib → PNG，内联显示、不弹窗

目标是让小朋友程序画的图**在前端卡片里真正看得到**，不弹原生窗口、不依赖本地文件服务。

- **turtle → SVG**：`python/kidturtle.py` 实现常用海龟子集（`forward/right/left/goto/circle/dot/penup/color/begin_fill/...`），每步画图命令记录成模块级画布 `_G`，结束时渲染成完整 SVG 字符串，再 base64 成 `data:image/svg+xml;base64,...`。runner 把这个模块注入成 `turtle`（`sys.modules['turtle'] = kidturtle`），所以小朋友代码里 `import turtle; t = turtle.Turtle()` 在无 GUI 环境也能直接跑。
- **matplotlib → PNG**：若环境装了 matplotlib，用 `Agg` 后端在退出前 `savefig` 成 PNG base64。当前这台机器没装 → 优雅跳过，不影响。
- **前端显示**：`<img src={svgDataUri}>` 内联渲染，`host.call('kidrun:run', {code})` 双向 RPC 传源码、回传结果。

### 五、前端「🧑🏫 小教室」卡片

复用 kid-storage 的既有范式（`conversation.input.dock` 常驻槽 + 可折叠 + `host.call` RPC），但交互从
「被动采集」改成「**点 Run 真执行 + 结果回显**」：

- 打开卡片**自动跑一遍默认示例**（画一个带小圆点的五角星），让图形马上出现。
- 折叠/展开：顶部一行标题可点击收起，符合系列统一交互。
- 代码框可编辑，点「✅ 跑一下」→ 就地刷新控制台输出 + 内联图形。
- 每次跑完显示用时（ms）；超时会提示「⏱️ 已被叫停」。

### 六、验证情况（全部在本地跑通）

| 项目 | 结果 |
|---|---|
| `npx tsc -p tsconfig.json` | ✅ 编译零错误 |
| `node cordis/precheck.mjs` | ✅ host.js / client.js 语法通过 |
| kid_run 跑海龟画图 | ✅ 输出 SVG（约 5.9KB），stdout 正常捕获 |
| 死循环 | ✅ 3 秒准时 `os._exit(42)` 叫停，返回已捕获的部分输出 |
| 语法错误 | ✅ 捕获编译错误，返回友好提示 |
| sandbox 禁网 | ✅ `connect` 被拦 |
| 编译后 kid_run e2e | ✅ 海龟 SVG + 超时两个分支都过 |
| 小教室卡片真机（harness web） | ✅ 自动出图 / 点「跑一下」刷新 / 折叠展开 / 中文输出正常 / 展开高度适配 |

真机联调补上了最后一块：`cordis/` 前端卡片此前只写了 `activate.md`、没在真实环境跑过，现在已在
harness web（`http://127.0.0.1:3080`）通过 `cordis_define` + `cordis_run` 真机跑通。

真机联调里还揪出并修掉两个**只有真跑才会暴露**的 bug：

1. **中文输出乱码**：宿主沙箱的 `btoa` 是 UTF-8 语义，第一版沿用前端的 `btoa(unescape(encodeURIComponent(src)))`
   会**二次编码**——`src.py` 落盘时就已经是乱码字节。我们改成写盘侧用手写（surrogate-pair 感知）UTF-8 编码 + base64，
   输出侧配套手写 UTF-8 解码，不再依赖 `btoa`/`TextEncoder`/`TextDecoder`。
2. **卡片展开后顶部够不着**：小教室挂在 `conversation.input.dock`，而 dock 属于 `position: sticky; bottom: 0`
   的**粘性页脚**，展开是向上生长；早期 `100vh - 32px` / `100vh - 190px` 预留不足，卡片能长到接近整屏高，
   顶部溢出到视口外，必须上划到底才能看到。我们用 `max-height: min(calc(100vh - 380px), 500px); overflow-y: auto`
   让页脚整体始终在视口内，内容只在卡片内部滚动，顶部常驻可见。

### 七、沙箱取舍（重要）

这套三层兜底**只保证「自家小孩写得玩得安全」**，是假想敌明确（好奇的小朋友自己写的简单代码），
**不是真正的安全边界**。`sandbox-exec` 已被苹果标记 deprecated，且隔离强度有限。若将来要把 kid-coder
开放给陌生人提交代码，需要再上 **Docker Desktop / 云端 Piston 之类真沙箱**。这个边界已在 README 和代码注释里明确标注。

## 结论与行动建议

**这次改造让 kidlab 系列四款插件全部统一为「B 型真执行 + 可折叠卡片」范式**，kid-coder 从「掉队者」
变成了补齐拼图的最后一块。技术上的核心收获有三点：

1. **安全边界的本质是「假想敌假设」**：明确「只防自家小孩的简单代码」后，sandbox-exec 三层兜底足够用；
   一旦假想敌升级（陌生人提交），就必须换真沙箱。
2. **安全场景的坑只在真执行时才暴露**：`os._exit` 不 flush、`sandbox-exec` 的参数语义、`btoa` 的 UTF-8
   二次编码——这类细节本地静态检查永远发现不了，必须真机联调。
3. **图形可视化可以零第三方依赖**：自研纯 Python SVG 海龟记录器，绕开 Homebrew python3 无 tkinter/matplotlib 的限制，headless 安全。

**行动建议**：

- 若后续要对外开放 kid-coder 的代码运行能力，优先评估 **Docker Desktop 或云端 Piston 真沙箱**，并把本次的三层兜底降级为「快速预览」层。
- 可与后三款一起，为 kidlab 系列补一篇「第四款也是最后一块拼图」的系列博客（可选）。

## 画图建议（供绘图模型参考）

**一句话给绘图模型**：请画一幅温暖明快的儿童编程主题插画——一个小朋友坐在卡通书桌前，屏幕上画着一颗带小圆点的亮黄色五角星，旁边弹出一个小窗口显示「跑一下 ✅」按钮和彩色输出；画面角落有一块写着「安全小沙箱」的圆形护栏罩住代码，体现「让孩子放心地亲手运行代码、实时看到图画结果」的核心理念。

**场景**：儿童学习编程的温馨桌面一角，小朋友专注而开心。
**主体元素**：书桌 + 电脑屏幕（内显五角星图形）+ 卡片式「小教室」界面（代码框、✅跑一下按钮、控制台输出区域）；屏幕旁可选一个卡通盾牌/小房子图标代表「安全沙箱」。
**风格**：扁平卡通 / 儿童教育插画风，柔和暖色（米黄、淡蓝、橙黄点缀），圆润线条，无复杂光影。
**构图建议**：主视觉居中为屏幕与代码卡片，右侧/底部留白，便于配标题文字；整体传达「自己动手跑代码、图立刻出现在眼前」的惊喜感。