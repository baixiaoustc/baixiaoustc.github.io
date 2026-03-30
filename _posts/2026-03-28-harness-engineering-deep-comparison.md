---
layout: post
title: "Harness Engineering 三篇文章深度对比"
date: 2026-03-28 10:00:00 +0800
categories: ai agent harness
tags: harness-engineering agent ai-native
---

> 本文是对三篇关于 Harness Engineering 的核心文章进行系统性对比与深度提炼，旨在帮助读者快速理解 Harness Engineering 的核心理念、设计原则与实践路径。

---

## 一、核心观点总览

| 文章 | 核心论点 | 一句话总结 |
|------|---------|-----------|
| **文章一**：《Harness is the New Dataset》 | Harness 决定 Agent 上限，而非模型本身 | "The Harness is the Dataset" —— 竞争优势在于 harness 能捕获的执行轨迹 |
| **文章二**：《从 Tool 到 Harness》 | Harness = 运行环境 + 管控系统 | Harness 不是简单的"工具箱"，而是让 Agent 可靠、安全、高效完成任务的完整系统 |
| **文章三**：《OpenClaw 的 Harness 设计》 | OpenClaw 爆火是 Harness 的胜利，而非模型能力 | "微小的创新被巧妙糅合" → 产生模型没有的生命力 |

---

## 二、Harness 演进三阶段

三篇文章共同勾勒出 Agent 技术的演进路径：

```
Prompt Engineering → Context Engineering → Harness Engineering (2026)
```

| 阶段 | 时间 | 核心关注点 | 局限性 |
|------|------|-----------|--------|
| **Prompt Engineering** | 2022-2023 | 如何写出更好的提示词 | 受限于模型上下文长度 |
| **Context Engineering** | 2023-2024 | 如何组织和管理上下文 | 缺乏系统性执行框架 |
| **Harness Engineering** | 2025-至今 | 如何构建完整的 Agent 运行环境 | 正在快速发展中 |

**关键洞察**：Agent = LLM + Harness，Harness 决定了模型能看到什么、能用什么工具、失败时怎么办。

---

## 三、Harness 核心组件对比

### 3.1 不同文章的组件划分

| 组件 | 文章一（六大组件） | 文章二（四层架构） | 文章三（五大组件） |
|------|-------------------|-------------------|-----------------|
| **记忆/上下文** | Memory & Context Management | - | 记忆机制 |
| **工具/技能** | Tools & Skills | 工具层（Tools） | Skills 库 |
| **编排/协调** | Orchestration & Coordination | 协调层（Orchestration） | - |
| **环境/基础设施** | Infra & Guardrails | 环境层（Sandbox） | Gateway |
| **评估/验证** | Evaluation & Verification | - | - |
| **追踪/可观测性** | Tracing & Observability | 反馈层（Feedback） | - |
| **主动机制** | - | - | Heartbeat |
| **人格/身份** | - | - | Soul.md |

### 3.2 核心组件详解

**1. Memory & Context Management（记忆与上下文管理）**
- 文章一：强调上下文窗口利用率控制在 60% 以下，渐进式披露
- 文章三：持久积累经验、不断进化，让 Agent 拥有"记忆"

**2. Tools & Skills（工具与技能）**
- 文章一：Tools 越少而精越好，精简工具集提升可靠性
- 文章二：外部 API 调用、文件操作、搜索等，权限最小化
- 文章三：Skills 库作为百宝箱，丰富能力集合

**3. Orchestration & Coordination（编排与协调）**
- 文章一：Research → Plan → Execute → Verify 必须分开
- 文章二：任务分解、子 Agent 调度、错误恢复
- 利用 subagent 做 context 隔离（context firewall）

**4. Infra & Guardrails（基础设施与护栏）**
- 文章一：环境隔离、权限控制、安全审计
- 文章二：沙箱隔离、代码执行环境、网络隔离
- 文章三：Gateway 破壁，统一对接社交软件

**5. Evaluation & Verification（评估与验证）**
- 文章一：人最该介入的是事前规划，不是事后审核
- 构建反馈闭环：失败 → 记录 → 系统永久变好

**6. Tracing & Observability（追踪与可观测性）**
- 文章一：全程记录、透明可追溯
- 文章二：执行轨迹记录、效果评估、持续优化
- 文章三：Harness 即 Dataset，捕获的执行轨迹形成数据飞轮

**7. 独特组件（仅文章三提及）**
- **Heartbeat**：补齐 AI 的"主观能动性"，定时自发醒来干活
- **Soul.md 等身份文件**：画龙点睛，注入鲜活人格
- **跨平台存在感**：WhatsApp/Discord/飞书，像朋友一样出没

---

## 四、设计原则对比

### 4.1 文章一的 7 个 Trick

| Trick | 核心思想 | 实践建议 |
|-------|---------|---------|
| **Trick 1** | 渐进式披露 | CLAUDE.md 三层分级：全局 → 工作流 → 技术 |
| **Trick 2** | 精简工具集 | Tools 越少而精越好，提升可靠性 |
| **Trick 3** | 控制上下文 | Context window 利用率控制在 60% 以下 |
| **Trick 4** | 上下文隔离 | 利用 subagent 做 context firewall |
| **Trick 5** | 流程分离 | Research → Plan → Execute → Verify 分开 |
| **Trick 6** | 事前规划 | 人最该介入的是事前规划，不是事后审核 |
| **Trick 7** | 反馈闭环 | 失败 → 记录 → 系统永久变好 |

### 4.2 文章二的关键设计原则

| 原则 | 具体实践 |
|------|---------|
| **安全性优先** | 沙箱隔离、权限最小化、操作可审计 |
| **可观测性** | 全程记录、透明可追溯、便于调试优化 |
| **容错性** | 失败可恢复、错误可重试、异常可降级 |

### 4.3 文章三的核心启示

| 启示 | 说明 |
|------|------|
| **Harness 价值 > 模型** | Harness 创造的价值大于模型本身 |
| **微小创新糅合** | 微小的创新被巧妙糅合，产生模型没有的生命力 |
| **化学反应** | Harness 设计的艺术不是堆砌功能，而是创造"化学反应" |

---

## 五、创业机会与商业前景

### 5.1 文章一梳理的 5 大创业方向

| 层级 | 代表公司 | 融资情况 | 核心能力 |
|------|---------|---------|---------|
| **信息层** | Edra | $30M A轮，Sequoia | 信息整合与上下文管理 |
| **执行层** | Temporal | $300M D轮，$5B估值 | 工作流编排与任务执行 |
| | Oasis Security | $120M B轮 | 安全执行环境 |
| | Daytona | $24M A轮 | 开发环境管理 |
| **反馈层** | Braintrust | $80M B轮，$800M估值 | 评估验证与效果追踪 |

### 5.2 未来演进方向

| 演进阶段 | 核心概念 | 关键特征 |
|---------|---------|---------|
| **Coordination Engineering** | 协调工程 | multi-agent networks，小龙虾版飞书（监工看板 + IM 平台） |
| **四级范式** | 能力层级 | L1 问答质量 → L2 认知边界 → L3 执行闭环 → L4 组织协同 |
| **终极形态** | Intention Engineering | 人只负责设定目标函数 |

---

## 六、Harness Engineering 四级范式

三篇文章共同指向的演进路径：

```
L1: 问答质量（Prompt Engineering）
    ↓
L2: 认知边界（Context Engineering）
    ↓
L3: 执行闭环（Harness Engineering）
    ↓
L4: 组织协同（Coordination Engineering）
```

| 级别 | 名称 | 核心问题 | 关键能力 | 对应工程 |
|------|------|---------|---------|---------|
| **L1** | 问答质量 | 如何让模型回答得更好？ | 提示词优化、Few-shot、CoT | Prompt Engineering |
| **L2** | 认知边界 | 如何让模型知道更多？ | RAG、上下文管理、知识库 | Context Engineering |
| **L3** | 执行闭环 | 如何让模型真正做事？ | 工具调用、任务编排、错误恢复 | Harness Engineering |
| **L4** | 组织协同 | 如何让多智能体协作？ | 多Agent协调、角色分工、通信协议 | Coordination Engineering |

---

## 七、核心金句与关键洞察

### 7.1 三篇文章的核心金句

| 文章 | 金句 | 含义 |
|------|------|------|
| **文章一** | "The Harness is the Dataset" | 竞争优势在于 harness 能捕获的执行轨迹 |
| **文章二** | "Harness 是马具，模型是野马" | Harness 让模型可控、可驾驭 |
| **文章三** | "微小的创新糅合产生生命力" | 组件单独看不复杂，组合产生化学反应 |

### 7.2 最重要的 10 个共识要点

1. **Agent = LLM + Harness**，Harness 决定上限，不是模型
2. **Harness 演进三阶段**：Prompt → Context → Harness Engineering
3. **Harness 核心组件**：Memory、Tools、Orchestration、Guardrails、Evaluation、Tracing
4. **设计原则**：渐进式披露、Tools 精简、Context 控制在 60%、Subagent 隔离
5. **关键流程**：Research → Plan → Execute → Verify 必须分开
6. **反馈闭环**：失败 → 记录 → 系统永久变好（Harness 即 Dataset）
7. **创业机会**：信息层、执行层、反馈层都有独角兽级机会
8. **未来演进**：Coordination Engineering（多 Agent 协调）→ Intention Engineering
9. **四级范式**：L1 问答 → L2 认知 → L3 执行 → L4 协同
10. **核心金句**："The Harness is the Dataset" —— 竞争优势在于捕获的执行轨迹

---

## 八、总结与展望

### 8.1 核心结论

Harness Engineering 是 **2026 年 Agent 领域的核心战场**。三篇文章从不同角度论证了同一个观点：**谁把 Harness 跑顺，谁就能捕获高质量执行轨迹，形成数据飞轮，最终赢得竞争**。

| 维度 | 共识 |
|------|------|
| **技术演进** | Prompt → Context → Harness → Coordination |
| **核心竞争力** | 不是模型能力，而是 Harness 质量 |
| **数据飞轮** | Harness 即 Dataset，执行轨迹是护城河 |
| **创业机会** | 信息层、执行层、反馈层都有独角兽 |
| **终极形态** | Intention Engineering —— 人只设定目标 |

### 8.2 实践建议

基于三篇文章的提炼，给正在构建 Agent 系统的开发者以下建议：

1. **优先投资 Harness，而非追逐最新模型**
   - 一个中等模型 + 优秀 Harness > 顶级模型 + 简陋 Harness

2. **从第一天就开始记录执行轨迹**
   - Harness 即 Dataset，今天的日志是明天的竞争优势

3. **设计渐进式披露的上下文管理**
   - 不要让模型一次性看到所有信息，按需提供上下文

4. **流程必须分离：Research → Plan → Execute → Verify**
   - 不要试图用一个步骤做完所有事情

5. **构建反馈闭环，让系统从失败中学习**
   - 失败 → 记录 → 系统永久变好

### 8.3 未来展望

Harness Engineering 的演进不会停止，我们可以预见：

- **2026-2027**: Harness Engineering 成为 Agent 开发的标配方法论
- **2027-2028**: Coordination Engineering 崛起，多 Agent 协作成为主流
- **2028-2030**: Intention Engineering 初现雏形，人类只负责设定目标，AI 自主规划执行

**最终，Harness 将隐形**

就像今天的操作系统——用户不需要理解内核调度、内存管理，只需要打开应用完成任务。未来的 Harness 也会如此：开发者不需要理解复杂的 Agent 架构，只需要声明意图，Harness 自动编排执行。

**但在此之前，我们需要把 Harness 跑顺。**

---

*本文档基于三篇核心文章整理：*
1. *《Harness is the New Dataset》*
2. *《从 Tool 到 Harness》*
3. *《OpenClaw 的 Harness 设计》*

*整理时间：2026-03-28*
