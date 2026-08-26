---
layout: post
title: "给小朋友看的电脑体检：DeepSeek Harness 插件从工具到前端可视化"
date: 2026-08-24 00:00:00 +0800
categories: deepseek harness plugin
tags: DeepSeek Harness Cordis 动态插件 React macOS 资源监控 可视化
---
# 给小朋友看的电脑体检：DeepSeek Harness 插件从工具到前端可视化

**日期**: 2026-08-24
**关键词**: DeepSeek Harness、Cordis、动态插件、React、macOS 资源监控、可视化

## 核心结论（30 秒速览）
- 用 DeepSeek Harness（Cordis）给 MacBook 做了一个资源监控插件，并从"查询工具"演进到"面向小朋友的前端可视化"。
- 关键发现：Harness 的**静态 Cordis 插件无法自带前端 UI**；要展示定制界面，必须走它的**动态插件机制**（`cordis_define` / `cordis_run`），由 `code.host` 采集 + `code.client`（React）渲染。
- 最终交付「🐻 小熊体检卡」：健康分 + CPU/内存/磁盘/电池四个圆环仪表 + 每 5 秒自动刷新，数据全部来自真实 macOS 命令。
- 两 half 代码通过预检并已在 harness web **实机跑通**：经历 5 个版本迭代（pkg-1→pkg-5），最终 `macsys-1/pkg-5` 正常运行、数值经真机核对正确（CPU 51% / 内存 60% / 磁盘 71% / 电池 97%）。

## 正文内容

### 1. 背景 / 问题引入

DeepSeek Harness 是 DeepSeek 开源的 Agent 框架（Cordis 架构，口号"Everything is a Plugin"）。此前我们已经为它做过一个"kid-coder"教学插件，统一挂在 `@kidlab` 命名空间下，专为小朋友介绍电脑与编程。

在此基础上，我们希望做一个**查询 MacBook 资源使用情况**的工具插件，并能把数据在 **web 前端展示出来，风格可爱、面向小朋友**。这既是一次插件开发，也触碰了 Harness 前端扩展机制的能力边界。

### 2. 第一阶段：静态工具插件（mac-sysmon）

第一版是一个标准的静态 Cordis 插件 `@kidlab/dsh-mac-sysmon`，注册工具 `system_status`，真正在 macOS 上执行命令采集实时数据。

**数据来源命令（全部免 sudo）**：

| 维度 | 命令 |
|---|---|
| 系统 | `sw_vers` / `uname -m` / `sysctl hw.model` / `sysctl hw.ncpu` |
| CPU 型号 | `sysctl machdep.cpu.brand_string` |
| CPU 占用 | `top -l 2 -n 0 -s 1`（瞬时），失败降级 `top -l 1`（单帧均值） |
| 内存 | `sysctl hw.memsize` / `memory_pressure` / `sysctl vm.swapusage` |
| 磁盘 | `df -h /` |
| 网络 | `route -n get default` / `ping -c 3` / `netstat -ib` |
| 电池 | `pmset -g batt` / `system_profiler SPPowerDataType` |
| 负载 / 进程 | `uptime` / `ps -Arco pid,pcpu,pmem,comm` |

工具参数 `scope` 支持 `all | cpu | mem | disk | net | battery | load | process` 按需采集。设计要点：每个维度独立采集、单条命令失败只报一行错误不中断整体；需 root 的项（如温度）主动排除，避免卡死。

**真机验证**：`dsh --profile headless` 一次任务即返回真实数据 —— CPU 42.0%、内存 8GB 用 38%（swap 8.6G）、负载 9.39/8.04/6.82，端到端（模型→工具→macOS 命令→结构化返回）跑通。

**关键排障**（详见开发过程记录）：
- 工具 `execute` 用 `node:child_process` 的 `execFile('/bin/sh', ['-c', cmd], {timeout})` 真正跑命令，命令硬编码常量防注入。
- 本地单测必须**先 `pnpm install` 接入 workspace**，否则解析不到 `@deepseek-ai/dsh-tools`（workspace 内部包，不在根 node_modules 顶层）。
- 构建用根目录二进制 `tsc`，跳过 `pnpm run build` 的 install 校验；`TS2688` 是兄弟目录 @types/node 告警，不影响产物。
- 高负载下 `top -l 2` 两次采样偶发超时，需 fallback 到 `top -l 1`。

### 3. 第二阶段：前端可视化 —— 关键机制探索

我们最关心的是「前端展示」这一环：希望把采集到的数据用可爱的界面呈现给小朋友。探索 Harness web 后得到**关键结论：静态插件带不动前端**。

- `packages/extensions/ui-cordis` 内建客户端插件，用 `ctx.slots.inject('tool.call.toolview', …)` 注册工具可视化组件。
- `packages/extensions/cordis-client-runner` 存在**动态插件**机制：client half 是"浏览器闭包"，`new Function` 评估一段 JS 返回插件。
- 第三方要带前端，走 **`cordis_define` / `cordis_run`**：插件由 `code.host` + `code.client` 两块纯 JS 组成，client half 挂到对话卡的 `tool.view.cordis` 槽位（`key: 'self'`）。

两块 half 的执行环境约束差异很大：

| 维度 | host half（node:vm 沙箱） | client half（浏览器闭包） |
|---|---|---|
| 可用符号 | `ctx` / `harness.handle` / `console` / `btoa`·`atob` | `React` / `styles.insert` / `host` / `console` |
| 禁用 | `require` / `fetch` / `setTimeout`（触即 throw 并指向服务替代） | `harness`（host 专属，touch 报错）、导入 |
| 跑命令 | `inject:['shell']` + `ctx.shell.run({command,timeoutMs})` | 无，只能 `host.call` 走 RPC |
| 渲染 | 无 UI | `React.createElement`（无 JSX/TS/import） |
| 定时 | Cordis timer service（`inject:['timer']`） | `ctx.interval` |

架构上数据通道闭合：host 端 `harness.handle('sysmon:collect', …)` 暴露 RPC，client 端 `host.call` 定时拉取，JSON 往返。

### 4. 第二阶段：实现「🐻 小熊体检卡」

**产物文件**（`plugin-mac-sysmon/cordis/`）：

| 文件 | 作用 |
|---|---|
| `host.js` | code.host。CPU/内存/磁盘/电池/负载/Top 采集 + `sysmon:collect` RPC handler；`Promise.all` 并发跑命令、逐项容错、返回标量 JSON。注：实机最终 CPU 采集改用 `iostat -w 1 -c 2 \| tail -1`（`top`/`ps` 被受限沙箱拦截），详见第 5 节 |
| `client.js` | code.client。小熊体检卡 React 组件：健康分 + 4 圆环仪表 + Top 进程 + 5s 自动刷新 + 可爱 CSS |
| `precheck.mjs` | 用 `node:vm` 预检两 half 语法（等价 harness 定义时 precheck，保证 `cordis_define` 一次过） |

**视觉效果明细**：
- 标题「🐻 小熊体检 · 这台电脑」，副标题显示 CPU 型号。
- 健康分徽章三档配色：ok（≥80，绿）/ mid（55–79，黄）/ bad（<55，红）。
- 四个 SVG 圆环仪表：CPU / 内存 / 磁盘 / 电池；渐变描边、中央 emoji，颜色随占用 绿→黄→红。
- 底部「谁在用电脑？」Top 进程列表（前 4 条，显示 CPU% 与 PID）+「每 5 秒偷偷看一眼」+ 更新时间戳。

**面向小朋友的交互话术**：
- ≥80：**🐻 超健康！电脑精神棒棒哒 ✨**
- 55–79：**🐻 还行～它有点累，注意休息 💤**
- <55：**🐻 唔…它好累呀，快让它歇歇 🔥**

**本地验证**：`node cordis/precheck.mjs` → 两 half 均 `[OK]`。

### 5. 实机运行与调试（已跑通，pkg-1 → pkg-5）

在 harness web「创造模式」会话把动态插件真正跑起来，经过 5 个版本迭代、4 个坑，最终 `macsys-1/pkg-5`（run-5）正常运行、数值正确。

**激活流程**：`cordis_define`（idPrefix=`macsys`）→ `cordis_run` → 遇 `awaiting-approval`**停在授权**由你手动点一次 ✓（不自动重试）→ `run-1 completed`。

**版本演进**：

| Package | 变更 | 结果 |
|---|---|---|
| pkg-1 | 初版（忠实原始设计） | client 渲染崩溃 `ctx is not defined` |
| pkg-2 | client: ctx 走 props；host: `stdout.text`+`resolve`；top 解析顺序 | 渲染正常，数值仍不全 |
| pkg-3 | host 修复整理 | 内存/磁盘/电池有值 |
| pkg-4 | host: CPU 改 `iostat -c 2 2` | CPU 因采样不结束仍空 |
| pkg-5 | host: CPU 改 `iostat -w 1 -c 2` | ✅ running，数值正常 |

**四个坑（真机暴露，设计阶段想不到）**：

1. **`ctx is not defined`（client 崩溃）**——client 闭包只有 `React/styles/host/console`，**没有 `ctx`**；`CutePanel` 在模块顶层定义却自由引用 `ctx.interval`，而 `inject:['slots','timer']` 只把 `ctx` 注入 `apply`，进不了组件作用域。修：组件经 **props** 收 `ctx`，注册时 `(p)=>createElement(CutePanel,{...p,ctx})`。
2. **`stdout` 不是 string，数值全空（核心坑）**——`packages/shell` 契约显示 `stdout` 类型是 `CollectedOutput`：`{ text, truncated, spillPath? }`。原写 `typeof r.stdout==='string'` **恒为 false** → 全部解析空串 → 圆环全是 `?`。连带 `shell.run` 要吃 **resolve 过的 `ShellExecSpec`**：`const spec=shell.resolve({command,timeoutMs})` → `shell.run(spec)` → 读 `r.stdout.text`；并顺带修正 macOS `top` 实际 `CPU usage: 3% user, 5% sys, 91% idle` 的解析顺序。
3. **沙箱拦 `top`/`ps`**——受限 shell 里 `top`、`ps` 报 `Operation not permitted`，plugin host 走同一 `ctx.shell` 同样受限。栈底改为可用的 `iostat` 取 CPU（末尾 `... us sy id`，`us+sy`）。
4. **`iostat -c 2 2` 不结束踩超时**——`iostat -c 2 2` 在该环境不自然结束（之前 `| head` 出结果是因为管道被拆断），裸 `| tail` 等 EOF 挂起 → 触发 host run 的 6s 超时。改**有限采样** `iostat -w 1 -c 2 | tail -1`（约 1s 退出）→ 通过。

**端到端真机核对（host 解析结果）**：

| 指标 | 命令 | 实测 | 卡片值 |
|---|---|---|---|
| CPU | `iostat -w 1 -c 2 \| tail -1` | `us=32 sy=19` | 51% |
| 内存 | `memory_pressure \| grep 'free percentage'` | `free percentage: 40%` | 60% |
| 磁盘 | `df -h /` 取 `/(\d+)%/` | 71% | 71% |
| 电池 | `pmset -g batt` | `97%; charged` | 97% |

「谁在用电脑」进程列表因沙箱拦 `ps` 留空（canvas 不渲染那一块），不影响主圆环与健康分。

**补充经验**：Cordis Package **不可覆盖**，改代码 = 追加新 Package + `cordis_run mode=update`（旧版保留可回滚）；排查 client 崩溃看 Run 卡的 `renderFailure` 堆栈（`cordis_inspect_self`）定位行号；别被「本地用 `head` 截断能出结果」误导，要确认命令本身能自然结束，否则在 host run 的 timeout 下拿空。

### 6. 为什么必须在「创造模式」里激活

「创造模式」＝ **cordis preset**（`apps/cli/config/agent-presets/cordis/`，order 4）。它不是另一套内核，而是 standard 编码 Agent 的**严格超集**：把标准能力原样保留，额外注入一套“自指 Cordis 工具集”（`@deepseek-ai/dsh-tool-cordis`，含 `cordis_define` / `cordis_run` / `cordis_mount` / `cordis_inspect_*`），并配一个教如何改构造的 skill（`editing-cordis-compositions`）。

**关键差异：常规会话“调用”工具，创造模式能“修改”运行时**。四种预设对比：

| 预设 | 中文名 | 定位 | 能否读/改运行时（cordis 工具） |
|---|---|---|---|
| standard | 标准 | 完整编码 Agent（默认） | ❌ |
| code | PTC | 标准能力 + Code Mode SDK 组合工具 | ❌ |
| minimal | 极简 | 仅 bash + 编辑器双工具 | ❌ |
| **cordis** | **创造** | 标准能力 + 自指工具集（author another agent） | ✅ |

**为什么动态插件只能在这模式用**：

1. 前端动态插件（带 `code.client`）只能经 `cordis_define` 注册，而它属于这套自指工具集 → 只有创造模式会注入它，普通 preset 压根没有这个工具。
2. 该 preset 的 persona 原话是*“You can read and modify the harness you run on… to author another agent”*——即把**正在运行的 Harness 运行时本身**当作可读写对象。
3. 这是**安全设计**：`cordis_mount` 会对 live runtime 求值模型写的 JavaScript，官方明示“开一个此模式的会话≈获得 shell 访问 / 处于信任边界”；因此这套能力**默认只给创作/授权场景**，且每步 `define` / `run` 都过 `awaiting-approval` 授权门。

一句话：不是激活流程笨拙，而是“能改运行时”的能力天然只配给创作/授权场景，普通会话不该拿到。

### 7. 结论与建议

**核心发现**：
- Harness 的前端能力门槛在"动态插件"而非静态插件；要给 Harness 做自定义 UI，`cordis_define` + `tool.view.cordis` 是正解。
- 动态插件把"服务端执行"与"浏览器展示"硬性拆成两个受约束的 half，数据必须经 `host.call` 走 JSON RPC —— 这天然约束了模型所写插件的边界，也是安全设计。
- 踩坑沉淀：静态插件带不动前端；host 沙箱无 `require/fetch`（跑命令用 `ctx.shell`，另有 `ctx.fs`/`ctx.web`）；client 无 JSX（全部 `React.createElement`）；跨 half 只传标量 JSON。

**行动建议**：
- 要在 Harness web 看到小熊体检卡：走第 5 节的创造模式激活流程。
- 这条"静态工具 + 动态前端"的双层模式，可作为 kidlab 系列（给小朋友讲电脑/编程）的通用脚手架持续复用，已沉淀进 `kidlab-harness-plugin` skill 的 `references/frontend.md`。

## 参考资源
- 本合并稿整理自同日三份文档：插件说明、前端结果、开发过程复盘（`~/Documents/2026-08-24-mac-sysmon-*`）。
- 官方权威指南：`apps/cli/config/agent-presets/cordis/skills/cordis-plugin-development/SKILL.md`。
- 代码产物：`~/Code/deepseek-harness-dev/plugin-mac-sysmon/cordis/`。