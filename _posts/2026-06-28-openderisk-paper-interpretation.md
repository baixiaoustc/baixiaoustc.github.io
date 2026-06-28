---
layout: post
title: "OpenDerisk 论文解读"
date: 2026-06-28 08:00:00 +0800
categories: ai-sre research
tags: "OpenDerisk AI-SRE DeRisk 论文解读 多智能体 Multi-Agent ReAct MCP 知识引擎"
---

> 本文解读我们团队在 Ant Group 完成的工业级 AI-SRE 框架论文 OpenDerisk。论文提出面向 SRE 场景的专业化多智能体架构，整合多智能体协作、可插拔推理引擎、领域知识引擎与 MCP 协议，已在蚂蚁集团生产环境服务 3,000+ 日活用户、60,000+ 次日运行，并已开源。

---

## 论文信息

| 项目 | 内容 |
|---|---|
| **标题** | OpenDerisk: An Industrial Framework for AI-Driven SRE, with Design, Implementation, and Case Studies |
| **arXiv** | [2510.13561 v2 [cs.SE]](https://arxiv.org/abs/2510.13561) |
| **PDF** | [https://arxiv.org/pdf/2510.13561](https://arxiv.org/pdf/2510.13561) |
| **HTML** | [https://arxiv.org/html/2510.13561v2](https://arxiv.org/html/2510.13561v2) |
| **开源代码** | [https://github.com/derisk-ai/OpenDerisk](https://github.com/derisk-ai/OpenDerisk) |
| **机构** | Ant Group |
| **作者** | Peng Di, Faqiang Chen, Xiao Bai, Hongjun Yang, Qingfeng Li, Ganglin Wei, Jian Mou, Feng Shi, Keting Chen, Peng Tang, Zhitao Shen, Zheng Li, Wenhui Shi, Junwei Guo, Hang Yu |
| **发表时间** | 2025-10-15（v1），2025-10-16（v2） |
| **相关 DOI** | [10.1145/3786583.3786864](https://doi.org/10.1145/3786583.3786864) |

---

## 一、为什么写这篇论文

这篇论文源于我们在 Ant Group 做 DeRisk / AI-SRE 过程中遇到的真实问题：现代分布式系统的复杂度已经超出人类 SRE 团队能持续承载的范围，而现有的自动化工具要么只能做模式匹配，要么是把通用多智能体框架硬塞进 SRE 场景，效果都不好。

我们想回答一个核心问题：**能不能设计一个系统，真正模拟专家 SRE 的调查式推理？** 不是简单回答问题，而是像人一样收集证据、提出假设、验证假设、定位根因。

最终我们把三年左右的工程实践沉淀成了 OpenDerisk，并选择开源。

---

## 二、我们认为 SRE 自动化的真正难点

SRE 任务的本质不是“生成”或“计算”，而是**调查（investigation）**。一次典型的故障排查包括：
- 从告警、日志、指标、链路、变更等多源信号中找线索；
- 结合业务知识和系统架构提出假设；
- 调用工具验证假设；
- 最后给出一个可执行的根因和修复建议。

这个流程对现有方案的挑战：
- **传统 AIOps**：擅长异常检测和依赖图传播分析，但缺乏语义理解，解释不了“为什么”。
- **通用多智能体框架**（MetaGPT、TaskWeaver、AutoGen）：为软件开发或通用任务设计，协作模式不适合 SRE 的调查式工作流。
- **OpenRCA 这类 SRE 多智能体系统**：迈出了第一步，但仍是通用问题求解思路，难以组织跨领域深度专家知识。

---

## 三、OpenDerisk 的设计选择

### 3.1 为什么选 Multi-Agent ReAct，而不是 Workflow

我们内部评估过几种技术路线：

| 范式 | 我们的判断 |
|---|---|
| **Workflow** | 太刚性，SRE 场景变化快，写死流程维护成本极高 |
| **Multi-Agent ReAct** | 在灵活性、可解释性、工程可控性之间取得平衡，是当前最务实的选择 |

ReAct + 多智能体分工是目前能把准确率、延迟、可控性同时推到可生产水平的架构。

### 3.2 四大核心组件

OpenDerisk 的架构可以概括为四层：

| 组件 | 定位 | 关键设计 |
|---|---|---|
| **Multi-Agent System** | 协作层 | 主管智能体 + 专业子智能体，支持 Single-Agent / TeamMode / GroupMode 三种协作模式 |
| **Reasoning Engine** | 认知层 | 可插拔：LLM ReAct 模式用于探索，SOP 模式用于例行任务，RL Dynamic 模式用于自优化 |
| **Knowledge Engine** | 记忆层 | 把企业文档、代码、历史工单、运维手册转化为可检索、可推理的知识库 |
| **MCP (Model Context Protocol)** | 协议层 | 标准化工具调用和上下文传递，保证模块化和可扩展 |

### 3.3 知识引擎的五阶段流水线

这是我们花了很多时间打磨的部分，因为 SRE 诊断的上限很大程度上取决于知识库质量：

1. **Knowledge Data Parsing**：读取、清洗、识别/翻译多源文档；
2. **Knowledge Data Chunking**：语义分块、结构分块、句子分块，避免信息碎片化；
3. **Semantic Enrichment & Augmentation**：抽取 FAQ、实体关系、领域概念；
4. **Hybrid Indexing**：KV + 向量 + 全文 + 知识图谱，多路召回；
5. **Active Learning & Update**：持续检测知识新鲜度，修正过期知识。

### 3.4 上下文工程引擎

长链路诊断最容易遇到 context window 爆炸和“lost-in-the-middle”问题。我们做了三件事：
- **Summary-Based Memory Compression**：把历史对话压缩成摘要；
- **Configurable Context Policies**：按重要性保留、截断或摘要信息；
- **Structured Report Distillation**：子智能体向主管智能体传递结构化摘要，而不是原始输出。

---

## 四、生产落地数据

论文里提到的生产数据是真实的：

| 指标 | 数据 |
|---|---|
| 新应用场景 | 13 个 |
| 新建专业智能体 | 50+ 个 |
| 日活跃用户 | 3,000+ |
| 日诊断运行次数 | 60,000+ |

这些数字背后是 SRE、开发、运维同学在日常工作中真实使用。我们不是做了一个 demo，而是把它变成了生产环境里的“副驾驶”。

---

## 五、实验基于的数据集与评测集

在回答实验结果之前，先把数据来源和评测方式说清楚，这是理解后续数字的前提。

### 5.1 Case Study 1：根因分析（RCA）

| 项目 | 说明 |
|---|---|
| **评测数据集** | 混合数据集：公开 **OpenRCA**（335 个场景）+ 蚂蚁内部 **AntRCA** |
| **AntRCA 来源** | 从 Ant Group 真实生产案例中整理，分布按日常 SRE 任务的真实比例调整 |
| **评分方式** | 人工打分的 100 分制评分表 |
| **测试模型** | Qwen-QWQ-32B、Deepseek-R1-0528、Bailing-Deepseek-V3 |
| **对比架构** | V1 Basic ReAct / V2 Phased-Control ReAct / V3 Multi-Specialist |

### 5.2 Case Study 2：链路分析（Trace Analysis）

| 项目 | 说明 |
|---|---|
| **评测方式** | 蚂蚁生产环境为期 **1 个月** 的生产试用 |
| **覆盖开发者** | **1,743** 名开发者 |
| **真实案例数** | **6,000+** 个真实案例 |
| **成功指标** | 聚合成功率 > **80%** |
| **质量指标** | 开发者 1–5 星评分 |
| **效率指标** | 端到端执行延迟 |
| **测试模型** | 15 个主流模型（详见表 2） |

### 5.3 消融研究（Ablation Study）

| 项目 | 说明 |
|---|---|
| **案例来源** | 从 **AntRCA**（与 Case Study 1/2 共用）和线上真实生产故障中选取的代表性业务逻辑相关案例 |
| **评估维度** | Localization Accuracy、RCA Depth、Evidence Completeness、Causal Chain、Operability 等 |
| **评分校准** | 由 SRE 专家进行一致性校准 |
| **对比架构** | V1 / V2 / V3 逐项对比 |

---

## 六、评估里我们最想说明白的几件事

### 6.1 三个版本对比：V1 → V2 → V3

我们设计了三个递增版本，想量化“多智能体专业化”到底能带来多少收益：

- **V1 Basic ReAct**：单智能体，Think → Act → Observe；
- **V2 Phased-Control ReAct**：单智能体，但把任务分成多个阶段，结构化控制；
- **V3 Multi-Specialist**：主管智能体 + 工作流引擎 + 多个专业子智能体。

**RCA 实验结果（Bailing-Deepseek-V3）**：

| 架构 | 得分 | 时间 |
|---|---|---|
| V1 | 39 | 2.5 min |
| V2 | 58 | 6.5 min |
| V3 | 76 | 9.1 min |

结论很直观：**准确率提升主要来自“分而治之”——把复杂诊断任务拆给专业智能体。但代价是延迟增加**，这是工程上需要权衡的。

### 6.2 多模型对比：不是所有推理模型都适合生产

我们在 Trace Analysis 场景下对比了 15 个模型。几个让我印象深刻的点：

- **Deepseek-R1**：分析质量其实不错，但速度太慢，达不到生产要求。
- **Deepseek-v3**：综合表现最好，成为生产首选候选。
- **Kimi-K2**：速度快，但结果波动大，偶尔超时，稳定性不够。
- **部分 Qwen 模型**：存在 JSON 解析困难，工程上需要额外处理。
- **Claude-Sonnet-3.5 / GPT-4o**：稳定、快、质量好，但成本和可控性是生产部署时要考虑的。

这个实验提醒我们：**模型选择不能只看 benchmark，生产环境要同时考虑稳定性、延迟、可维护性。**

### 6.3 消融研究：V3 的深层价值

表 3 的定性对比说明，V3 真正的价值不只是在平均分上，而是在**复杂跨模块故障**上能给出完整闭环。比如：
- 涉及配置、上游影响、代码逻辑交织的问题，V1 只能给浅层结论，V3 能追到根因；
- 需要跨团队知识的故障，V3 能把外部依赖内部化，减少 escalation。

---

## 七、局限与我们正在做的事

论文里写的局限是真实的：

1. **仍是副驾驶，不是自动驾驶**：最终修复动作需要人工确认。我们正在往 V4 的“pilot”方向演进。
2. **依赖知识库质量**：知识库是天花板，我们正在做自愈合知识引擎，让智能体自己发现知识缺失并补充。
3. **深度与延迟的权衡**：V3 更准但更慢，未来需要自适应推理控制器，根据场景动态选择深度。
4. **泛化性待验证**：目前主要在蚂蚁的可观测和数据体系内验证，外部环境的适配是开源后的重要课题。

---

## 八、这篇论文和此前思考的关联

此前聊过的 SRE-OS、Harness Engineering、Context Engineering 这些概念，OpenDerisk 可以看作是一个具体实现：

- **MCP ≈ 系统调用层**：把工具调用标准化；
- **Reasoning Engine ≈ SKILL / 可执行程序**：把诊断流程变成可复用、可插拔的模块；
- **K-Engine ≈ 文件系统 / SPEC**：把领域知识持久化、结构化；
- **Multi-Agent System ≈ 进程 + IPC**：从预设编排走向自主协作网络；
- **V4 pilot ≈ SKILL Daemon 化**：从单次会话走向 7×24 持续运行。

写成论文的过程，其实也是把这套工程实践抽象成可复用框架的过程。开源出来后，希望能和更多做 AI-SRE 的团队碰撞出新的方向。
