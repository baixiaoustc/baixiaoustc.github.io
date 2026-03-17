---
layout: post
title: "Pi 框架设计哲学与三个核心问题的讨论"
date: 2026-03-17 22:00:00 +0800
categories: openclaw ai-agent
tags: openclaw pi-agent coding-agent 设计哲学
---

**本文提纲挈领**：本文是 Pi 框架设计哲学的深度讨论记录。Pi 是 OpenClaw 背后的核心框架，由 Mario Zechner 创建的极简 Coding Agent。文章围绕三个核心问题展开：没有 plan mode 如何保证工作流稳定？OpenClaw 的 SubAgent 机制如何理解？只有 4 个工具是否足够？通过深入探讨 Mario 的设计哲学——"确定性 > 功能丰富"，揭示了 Pi 框架"做减法"的核心理念。

---

> 日期：2026-03-17  
> 来源：微信公众号文章《OpenClaw 背后核心框架 Pi：好的 Coding Agent 应该让用户来决定需要什么》

---

## 第一部分：原文核心内容总结

### 1. 什么是 Pi 框架

Pi 是当下最火的开源个人 AI 助手 **OpenClaw** 背后的核心框架。它是一个**极简的 Coding Agent 框架**，由奥地利开发者 Mario Zechner 创建。

**核心特点**：
- 系统提示词 + 工具定义 **不到 1000 tokens**（Claude Code 超过 10000 tokens）
- 核心工具只有 **4 个**：`read`、`write`、`edit`、`bash`
- 没有内置 plan mode、没有 to-do 系统、没有 MCP 支持、没有权限弹窗
- 不绑定任何特定模型

### 2. Mario 的设计哲学

#### 核心理念："做减法"

> "好的 coding agent 不应该预设你需要什么，而是应该让你自己决定需要什么。"

**关键洞察**：
- 经过大量 RL（强化学习）训练的大模型，**天然就知道 coding harness 是什么**
- 不需要在上面堆加太多东西
- 追求**确定性**：确定性的工具、确定性的系统提示词、确定性的行为

#### 明确"不做"的功能

| 不做 | 原因 | 替代方案 |
|-----|------|---------|
| **MCP** | 主流 MCP server 一次性灌入大量工具定义，消耗 7%-9% 上下文 | 写 CLI 工具 + README，按需调用 |
| **Plan Mode** | 黑箱操作，看不到子 agent 做了什么 | 直接对话："我们先想清楚，不要改文件"；或写 PLAN.md |
| **To-Do 系统** | 增加模型需要追踪的状态，引入更多出错机会 | 不需要 |
| **后台 Bash** | 进程管理引入大量复杂性，可观测性差 | 不做 |
| **内置 SubAgent** | Claude Code 在背后生成子 agent，完全不可见 | 用 bash 启动新 Pi 实例，完全可观测 |

### 3. 核心观点：确定性 > 功能丰富

#### 关于"AI 变笨了"

Mario 开发了 `cchistory` 工具追踪 Claude Code 的系统提示词变更，发现大量**"静默调整"**：
- 项目目录树注入被删除（污染上下文）
- 清理测试文件的指令被移除（过于激进）
- Bash 命令解释要求被去掉（降低服务器负载）
- Grep 工具重大重构

> "虽然每条变更都合情合理，但用户对此完全不知情，而每一条都可能改变模型在你 session 中的行为。"

#### 关于安全性

> "看看其他编程 agent 的安全措施，大部分都是**安全剧场**（security theater）。只要你的 agent 能写代码和执行代码，就已经 game over 了。"

Pi 的策略：**默认全开（YOLO 模式）**，把决定权交给用户。

### 4. 用户反馈

三位深度用户（Sentry 工程总监 Daniel、Pi 核心贡献者 Armen、Modem 创始人 Ben）分享了不同的使用工作流：

- **Daniel**：用自定义 skill 做规划（激进/务实/豪华三方案）→ scoutSubAgent 探索 → worker agents 实施 → Codex reviewerSubAgent 审查
- **Armen**：替换内置 edit tool 为 patch-based 多文件编辑；用 answer 扩展替代 plan mode 的提问工具；让 agent 验证时自动截图
- **Mario**：只有两个特定项目的扩展，追求极简体验

---

## 第二部分：讨论的三个问题

### 问题一：没有 plan mode 怎么保证比 Claude Code 的工作流稳定？

#### 核心区别：显式 > 隐式

| Claude Code | Pi |
|------------|-----|
| 内置 plan mode（黑箱，看不到子 agent 做了什么） | 用文件和对话显式规划 |
| 系统偷偷塞东西到上下文 | 用户完全控制上下文 |
| 频繁变更 harness 导致行为不稳定 | 确定性的工具和行为 |

#### Pi 的替代方案

**1. 显式规划文件（PLAN.md）**
- 直接告诉 agent："我们先一起想清楚这个问题，不要改文件也不要执行命令"
- 把计划写到 PLAN.md，agent 可以读、改、引用
- 文件随代码版本化，下次直接加载

**2. 可观测性 vs 黑箱**
- Claude Code：背后生成子 agent，用户完全看不到对话过程
- Pi：所有探索过程都在用户面前，可以看到 agent 读了什么、遗漏了什么
- 用 `/tree` 命令让 agent 探索代码库，做摘要后继续

**3. 状态持久化（断点续传）**
- 状态序列化到磁盘上的 JSON 和 Markdown 文件
- 可以从任意断点重启，用全新上下文继续
- 从根本上绕过上下文衰减问题

#### 一句话总结

> Claude Code 的 plan mode 是**"我帮你规划，你放心"**（黑箱，易变）  
> Pi 的替代方案是**"我们一起规划，你掌控"**（显式，稳定）

---

### 问题二：OpenClaw 有 SubAgent 机制，与原文反对的 SubAgent 用法如何理解？

#### 原文反对的是什么

Mario 反对的是 **"在 session 中途用 SubAgent 做上下文收集"**：

```
❌ 错误做法：
  Session A 跑了一半
  → 突然 spawn 一个 SubAgent 去探索代码库
  → 把探索结果塞回 Session A
  → 用户看不到 SubAgent 做了什么
```

**问题**：
- 破坏了 Session A 的连续性
- SubAgent 变成黑箱，不可观测
- 说明"没有提前规划好"

#### 原文推荐的做法

```
✅ 正确做法：
  独立的 Session B：专门做上下文收集
  → 产出 artifact（文件/摘要）
  → 全新的 Session C：加载 artifact，干净上下文开始
```

**优势**：
- 每个 session 目标单一、清晰
- 完全可观测、可操控
- artifact 可复用

#### OpenClaw 的 SubAgent 是哪种

OpenClaw 的 `sessions_spawn` 实际上是 **Mario 推荐的模式**，不是他反对的模式：

| 特征 | Mario 反对的 | OpenClaw 的 SubAgent |
|------|-------------|---------------------|
| 触发时机 | session 中途临时 spawn | 用户主动决定，或耗时任务时启动 |
| 上下文处理 | 偷偷收集，塞回主 session | 独立运行，产出 artifact |
| 可观测性 | 黑箱 | 主 session 可查询状态、日志 |
| 生命周期 | 依附于主 session | 独立 session，可异步完成 |

#### 一句话总结

- **Mario 反对**：session 中途**偷偷 spawn** SubAgent 收集上下文，破坏连续性
- **OpenClaw 做法**：**显式启动**独立 SubAgent，产出 artifact，主 session 决定加载 — 这正是 Mario 推荐的模式

---

### 问题三：只有 4 个工具是不是太少了？连浏览器操作都没有吗？

#### 为什么只有 4 个工具

##### 核心理念：让 AI 自己决定需要什么

Mario 的观察：
> "模型经过大量 RL（强化学习）训练后，**天然就知道 coding harness 是什么**，不需要在上面堆加太多东西。"

| 工具 | 用途 | 为什么足够 |
|------|------|-----------|
| `read` | 读文件 | 代码库分析的基础 |
| `write` | 写文件 | 创建新文件 |
| `edit` | 修改文件 | 精确编辑 |
| `bash` | 执行命令 | **万能工具** — 可以调用任何 CLI 工具 |

##### 对比：少即是多

| 特性 | Pi | Claude Code |
|------|-----|-------------|
| 系统提示词 | < 1000 tokens | > 10000 tokens |
| 内置工具 | 4 个 | 数十个 |
| 上下文占用 | 极小 | 很大 |
| 可预测性 | 高 | 受 harness 变更影响 |

#### 浏览器操作怎么办？

##### 答案：用 `bash` 调用 CLI 工具

Mario 的实际做法（文章中提到）：

```
不用 Playwright MCP（21个工具，13700 tokens）

而是用：CLI 工具 + README 文件
```

**具体方案**：

1. 写一个简单的浏览器自动化 CLI 工具
2. 配上 README 说明使用方法
3. agent 需要时：
   - 读 README（按需付出 token 成本）
   - 用 `bash` 调用 CLI 工具

**效果对比**：

| 方案 | Token 消耗 |
|------|-----------|
| Playwright MCP | 13,700 tokens |
| Mario 的 CLI 方案 | **225 tokens** (1/60) |

#### OpenClaw 与 Pi 的关系

你日常使用的 **OpenClaw 实际上比 Pi 更丰富**：

| | Pi (Mario 的设计) | OpenClaw |
|---|---|---|
| 核心工具 | 4 个 (read/write/edit/bash) | 更丰富 |
| 浏览器 | 用 bash 调用 CLI | **内置 browser 工具** |
| 多模型支持 | 不绑定特定模型 | 支持多种模型 |
| 网关架构 | 无 | 有 Gateway 层 |
| 子 Agent | 用 bash 启动新实例 | `sessions_spawn` |

**所以你的担心是多余的** — OpenClaw 已经内置了浏览器操作能力（就像你刚才用来打开这篇公众号文章一样）。

---

## 总结：三个问题的核心答案

### 问题一：没有 plan mode 怎么保证稳定？
**显式 > 隐式**：用 PLAN.md 文件显式规划，而不是黑箱 plan mode。

### 问题二：OpenClaw 的 SubAgent 怎么理解？
**Mario 反对**：session 中途**偷偷 spawn** SubAgent 收集上下文，破坏连续性  
**OpenClaw 做法**：**显式启动**独立 SubAgent，产出 artifact，主 session 决定加载 — 这正是 Mario 推荐的模式

### 问题三：4 个工具是不是太少？
**够用原则**：`bash` 是万能工具，可以调用任何 CLI。  
**OpenClaw 实际**：比 Pi 更丰富，已内置浏览器工具。

---

**核心洞察**：Mario 的 Pi 是在探索"极简的下限"，而 OpenClaw 是在 Pi 的基础上，根据实际需求做了合理的扩展 — 既保留了 Pi 的确定性哲学，又提供了更丰富的开箱体验。
