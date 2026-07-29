---
layout: post
title: "回顾 LLM 的基础：从 RNN 与 LSTM 到 LLM——循环网络在序列建模时代的遗产与新生"
date: 2026-07-29 00:00:00 +0800
categories: 机器学习 LLM
tags: RNN LSTM 循环神经网络 LLM Transformer Mamba
---

RNN 与 LSTM 不是被 Transformer 埋葬的古董，而是现代 LLM 序列思维的直系祖先。本文把 2018 年《循环网络实战：视频动作识别》中的模型原理部分，站在 2026 年重新解读，看隐状态循环、门控机制与 CNN+LSTM 结构如何在 GPT、Mamba、SwiGLU 和多模态 LLM 中找到新的拼图位置。

**日期**: 2026-07-29
**关键词**: RNN、LSTM、循环神经网络、LRCN、视频动作识别、序列建模、Self-Attention、Mamba、多模态 LLM

# 回顾 LLM 的基础：从 RNN 与 LSTM 到 LLM——循环网络在序列建模时代的遗产与新生

RNN 与 LSTM 不是被 Transformer 埋葬的古董，而是现代 LLM 序列思维的直系祖先。2018 年它们用隐状态传递时序信息、用门控保护长程记忆、用 CNN+LSTM 拼接感知与序列推理；2026 年，这些机制正以另一种形态运行在 GPT 的自回归生成、Mamba 的线性状态空间、SwiGLU 的门控前馈，以及 Video-LLaMA 等多模态 LLM 的血脉里。本文是「回顾 LLM 的基础」系列第 7 篇，承接第 6 篇对 DQN 与 Agent 价值估计的回顾，继续把 2018 年的循环网络拼图块放回今天 LLM 的版图。

---

# 原文回顾：循环网络实战：视频动作识别 - 模型原理（2018）

> 以下为 2018 年 6 月 Apple Keynote《循环网络实战：视频动作识别》整理稿（中篇）的完整内容。原文标题《视频动作识别：模型原理》。每节后附「🔍 LLM 视角」点评，站在 2026 年回溯这些概念对 LLM 的拼图贡献。

---

## 原文 §1：从 RNN 说起

循环神经网络(Recurrent Neural Network, RNN)天然适合处理序列数据。它的核心思想是:**每个时刻的输出不仅依赖当前输入,还依赖之前时刻的隐状态(hidden state)**。

![RNN 展开图](/assets/images/keynote-video-action-recognition-img/01-rnn-unroll.png)

如上图,左侧是 RNN 的循环表示,右侧是按时间展开后的等价形式:
- 输入序列: $x_0, x_1, x_2, \dots, x_t$
- 隐状态序列: $h_0, h_1, h_2, \dots, h_t$
- 同一组参数 $A$ 在每个时间步共享

对视频动作识别而言,可以把每一帧(或其特征)看作一个时间步的输入,让 RNN 逐帧累积动作信息。

### 1.1 RNN 的单元内部

RNN 单元内部只用一个简单的非线性变换(通常是 tanh)来更新隐状态:

![RNN 单元内部](/assets/images/keynote-video-action-recognition-img/02-rnn-cell.png)

### 1.2 长程依赖问题

RNN 虽然理论上能记忆任意长度序列,但随着序列变长,**梯度消失/爆炸**会导致模型难以学到久远时刻的依赖关系。课件里用高亮节点示意了:某些早期输入对后续时刻的影响会衰减。

![RNN 长程依赖](/assets/images/keynote-video-action-recognition-img/03-rnn-long-term-dependency.png)

---

### 🔍 LLM 视角：RNN 的「隐状态循环」是 GPT 自回归精神的祖先

2018 年的 RNN 把历史压缩进一个隐状态 $h_t$，每一步都执行「读入新输入、更新隐状态、产生输出」；2026 年的 GPT 系列则把历史展开成一个上下文窗口，每一步都执行「读入前面所有 token、计算 Attention、预测下一个 token」。两者共享同一个底层信念：**序列生成是一个逐步进行的过程，当前输出必须依赖此前内容**。

变化类型：**进化 / 革命**

| 维度 | 2018 RNN | 2026 自回归 LLM |
|---|---|---|
| 历史载体 | 固定维度的隐状态 $h_t$ | 可变长度的上下文窗口 |
| 历史访问 | 只能通过当前隐状态间接访问 | 通过 Self-Attention 直接访问任意位置 |
| 参数共享 | 同一组 $A$ 在每个时间步共享 | 同一组 Transformer 层处理每个位置 |
| 训练目标 | 动作类别分类 | 下一个 token 预测 |

RNN 的「循环」精神从未消失，只是载体从压缩向量变成了显式 token 序列。Transformer（Vaswani et al., 2017）的革命性不在于否定序列建模，而在于用 Self-Attention 新增了一个维度：**全局关系建模**。如果 RNN 是「边走边忘的旅人」，Transformer 就是「能随时翻阅历程全文的编辑」。

---

## 原文 §2：LSTM：长短期记忆网络

为了缓解 RNN 的长程依赖问题,Hochreiter & Schmidhuber 于 1997 年提出了 **LSTM(Long Short-Term Memory networks)**。LSTM 的核心是引入了一条贯穿时间步的"传送带"——**细胞状态(cell state)**,并通过三个门控结构决定信息的存留。

![LSTM 单元结构](/assets/images/keynote-video-action-recognition-img/04-lstm-cell.png)

### 2.1 门的直观理解

课件用"水坝"做类比,帮助理解"门(gate)"的概念:门就像一个可控的闸门,决定信息是放行还是截留。

![水坝门控类比](/assets/images/keynote-video-action-recognition-img/10-gate-analogy-dam.png)

LSTM 中有三个门:

1. **遗忘门(forget gate)**:决定上一时刻的细胞状态有多少被保留
2. **输入门(input gate)**:决定当前输入有多少被写入细胞状态
3. **输出门(output gate)**:决定细胞状态有多少被输出为当前隐状态

### 2.2 四个关键公式

**遗忘门:**

$$ f_t = \sigma\left(W_f \cdot [h_{t-1}, x_t] + b_f\right) $$

![遗忘门公式](/assets/images/keynote-video-action-recognition-img/05-lstm-forget-gate.png)

**输入门与候选记忆:**

$$ i_t = \sigma\left(W_i \cdot [h_{t-1}, x_t] + b_i\right) $$

$$ \tilde{C}_t = \tanh\left(W_C \cdot [h_{t-1}, x_t] + b_C\right) $$

![输入门公式](/assets/images/keynote-video-action-recognition-img/06-lstm-input-gate.png)

**细胞状态更新:**

$$ C_t = f_t * C_{t-1} + i_t * \tilde{C}_t $$

![细胞状态更新](/assets/images/keynote-video-action-recognition-img/07-lstm-cell-state-update.png)

**输出门:**

$$ o_t = \sigma\left(W_o \cdot [h_{t-1}, x_t] + b_o\right) $$

$$ h_t = o_t * \tanh(C_t) $$

![输出门公式](/assets/images/keynote-video-action-recognition-img/08-lstm-output-gate.png)

### 2.3 LSTM 整体回顾

把四个步骤拼起来,就得到了 LSTM 单元的完整信息流:

![LSTM 整体结构](/assets/images/keynote-video-action-recognition-img/09-lstm-overview.png)

---

### 🔍 LLM 视角：门控机制从 LSTM 的专用结构进化为现代 LLM 的通用组件

LSTM 的三门控（遗忘、输入、输出）是为解决 RNN 梯度消失而设计的专用结构；2026 年，门控思想已经脱离 LSTM 的循环外壳，成为 Transformer 前馈层和新一代线性 RNN 的标配。

变化类型：**进化 / 平移 / 新增**

**1. 门控进入 Transformer 前馈层**

GLU（Gated Linear Unit, Dauphin et al., 2017）及其变体 SwiGLU（Shazeer, 2020）把「门控选择信息」的思想带进了 Transformer。Llama、PaLM、Chinchilla 等主流 LLM 的 FFN 都采用了 SwiGLU：

```
2018 LSTM:        f_t = σ(W_f · [h_{t-1}, x_t] + b_f)
2026 SwiGLU:      SwiGLU(x) = (xW_1) ⊙ Swish(xW_2)
```

两者都通过可学习的门（σ 或 Swish）决定哪些信息被放行，只是 LSTM 的门控制跨时间步的记忆，SwiGLU 的门控制跨特征维度的信息流。

**2. LSTM 以新名字复活：Mamba、RWKV、xLSTM**

Transformer 虽然统治了 LLM，但 RNN/LSTM 的序列先验并未消亡，反而在 2023–2024 年以更强大的形态回归：

- **Mamba**（Gu & Dao, 2023）：用「选择性状态空间」（Selective State Space）让模型像 LSTM 一样维护一条跨时间步的隐藏状态，同时保持线性复杂度。它的「选择机制」本质上就是 LSTM 门控的连续化、参数化升级。
- **RWKV**（Peng et al., 2023）：把 Attention 重新表述为线性 RNN 的形式，用通道混合和 token 移位替代显式 Attention，兼具 RNN 的训练效率和 Transformer 的表达能力。
- **xLSTM**（Beck et al., 2024）：直接扩展 LSTM，引入指数门控和矩阵记忆，试图在 LLM 规模上重新挑战 Transformer。

| 2018 形态 | 2026 形态 | 关系 |
|---|---|---|
| LSTM cell state | Mamba 的 selective state | 进化：从固定门到输入依赖的选择门 |
| LSTM 三门控 | SwiGLU / Gated MLP | 平移：门控从循环单元进入前馈层 |
| RNN 隐状态传递 | RWKV 的线性 Attention | 进化：Attention 的 RNN 等价形式 |

LSTM 作为一个完整架构确实被 Transformer「革命」了，但它的门控遗产被保留、拆分、重组，继续为 LLM 的信息路由服务。

---

## 原文 §3：LRCN：CNN + LSTM

在视频动作识别中,最经典、最简洁的架构之一就是 **LRCN(Long-term Recurrent Convolutional Networks)**。它的思路非常直接:

1. 先用 **CNN** 对每一帧抽取视觉特征
2. 再把每一帧的特征向量按时序输入 **LSTM**
3. 最后接一个分类层输出动作类别

![LRCN 架构](/assets/images/keynote-video-action-recognition-img/12-lrcn-architecture.png)

### 3.1 为什么选 Inception V3?

课件中选择的 CNN 主干是 **Inception V3**,主要基于以下考虑:

- ImageNet 预训练,特征提取能力强
- 在 ILSVRC 上 Top-5 错误率从 v1 的 6.67% 逐步降到 v4 的 3.08%
- 相比 ResNet 系列,2018 年前后 Keras/TensorFlow 生态支持成熟

| 版本 | Top-5 错误率 | 代表论文 |
|---|---|---|
| GoogLeNet / Inception v1 | 6.67% | Going Deeper with Convolutions, 2014 |
| Inception v2 | 4.8% | Batch Normalization, 2015 |
| Inception v3 | 3.5% | Rethinking the Inception Architecture for Computer Vision, 2015 |
| Inception v4 | 3.08% | Inception-v4, Inception-ResNet, 2016 |

### 3.2 LRCN 不仅用于动作识别

LRCN 这种 CNN + LSTM 的结构还可以扩展到:

- **Image Description**: 单张图片 → CNN 特征 → LSTM 生成描述句子
- **Video Description**: 视频帧序列 → CNN + LSTM → 描述句子
- **Activity Recognition**: 视频帧序列 → CNN + LSTM → 动作类别

![LRCN 三种应用](/assets/images/keynote-video-action-recognition-img/13-lrcn-applications.png)

---

### 🔍 LLM 视角：LRCN 的「编码器-解码器」骨架是多模态 LLM 的史前形态

2018 年的 LRCN 已经拥有现代多模态 LLM 的全部结构性要素：**一个感知编码器把原始感官输入压缩成语义特征，一个序列模型把这些特征映射成语言或决策输出**。

变化类型：**进化**

| 维度 | 2018 LRCN | 2026 多模态 LLM |
|---|---|---|
| 视觉编码器 | Inception V3（ImageNet 预训练） | CLIP ViT / SigLIP / DINOv2 / EVA |
| 序列模型 | LSTM | Transformer Decoder |
| 训练目标 | 动作/描述分类 | 下一个 token 预测 / 指令跟随 / RLHF |
| 典型模型 | LRCN (Donahue et al., 2015) | LLaVA、Video-LLaMA、VideoChat、Qwen-VL |

**1. 从 Image Description 到 Image-LLM**

原文中 LRCN 的 Image Description 分支：图片 → CNN → LSTM → 句子。这与 2026 年的视觉语言模型（VLM）如 LLaVA（Liu et al., 2023）的架构几乎同构，只是组件升级：

```
2018 LRCN:   Image → Inception V3 → LSTM → "a dog is running"
2026 LLaVA:  Image → CLIP ViT → Transformer → "The image shows a golden retriever..."
```

**2. 从 Video Description 到 Video-LLM**

原文的 Video Description 分支：视频帧 → CNN + LSTM → 描述。2026 年的 Video-LLaMA（Zhang et al., 2023）、VideoChat（Li et al., 2023）等模型继承了同一思路，但把 LSTM 换成 Transformer，把 Inception V3 换成视频编码器或帧级视觉 Transformer，并用大规模图文/视频文本对预训练。

**3. 从 Activity Recognition 到视频理解基准**

原文用 LRCN 做动作分类；2026 年的视频理解任务已经扩展到时序定位、视频问答、长视频摘要、多模态检索等。底层技术栈仍然是「视觉编码 + 时序/序列推理」，只是序列模型从 LSTM 进化为 Transformer，视觉编码器从监督分类网络进化为对比学习预训练模型。

Inception V3 在 2018 年是工程落地的稳妥选择，而 2026 年的视觉塔已经被 CLIP（Radford et al., 2021）、SigLIP（Zhai et al., 2023）等对比学习模型重新定义。它们不仅为分类服务，更擅长把图像/视频映射到与语言对齐的语义空间——这正是多模态 LLM 能够「看懂」世界的前提。

---

## 原文 §4：小结

本文从 RNN 的序列建模能力出发,说明了它的长程依赖缺陷,进而介绍了 LSTM 的细胞状态与三门控机制,最后落脚到视频动作识别的经典结构 **LRCN = Inception V3(CNN) + LSTM**。

下一篇将进入实战环节:数据预处理、训练流程、UCF101 上的 top1/top5 结果,以及与其他主流方法(Two-Stream、3D-CNN、C3D、I3D、iDT)的对比。

---

### 🔍 LLM 视角：从视频动作识别到通用序列智能

2018 年的这篇讲稿无意中勾勒了一条通往通用序列智能的技术路线：**感知 → 序列记忆 → 语义输出**。RNN/LSTM 负责中间的「序列记忆」，CNN 负责「感知」，最后的分类器负责「输出」。

2026 年的 LLM 把这条路线泛化到了任意模态和任意任务：

- **感知**：从 CNN 到 Vision Transformer、Audio Encoder、多模态编码器
- **序列记忆**：从 LSTM 的隐状态到 Transformer 的上下文窗口，再到 Mamba 的选择性状态空间
- **语义输出**：从动作类别/描述句子到任意文本、代码、工具调用、推理链

变化的不是「编码器-序列模型-解码器」的宏观架构，而是每一层的能力边界和规模。2018 年的 LRCN 是一个针对视频动作识别的专用拼图；2026 年的多模态 LLM 是用同一套骨架组装起来的通用拼图。

---

# 总结：2018 → 2026 的拼图全貌

| 拼图块 | 2018 形态 | 2026 LLM 形态 | 变化类型 |
|---|---|---|---|
| **序列建模范式** | RNN 隐状态循环传递 | Transformer 自注意力 / Mamba 状态空间 / RWKV 线性注意力 | 进化 / 革命 |
| **长程依赖机制** | LSTM 细胞状态 + 三门控 | Self-Attention 全局关联 / Mamba 选择性扫描 | 革命 / 进化 |
| **门控机制** | LSTM 遗忘/输入/输出门 | SwiGLU / GLU / Gated MLP / Mamba 选择门 | 平移 / 进化 |
| **视觉编码器** | Inception V3（ImageNet 监督预训练） | CLIP ViT / SigLIP / DINOv2（对比/自监督预训练） | 进化 |
| **多模态架构** | LRCN = CNN + LSTM | LLaVA / Video-LLaMA / VideoChat = 视觉编码器 + Transformer | 进化 |
| **训练目标** | 动作分类交叉熵 | 下一个 token 预测 / RLHF / DPO / 指令跟随 | 进化 / 新增 |
| **状态表示** | 单帧 CNN 特征向量序列 | 多模态 token 嵌入序列 + 位置/时序编码 | 进化 |

---

**四个核心结论**：

1. **RNN 的「自回归、隐状态传递」思想是 GPT 等 LLM 的精神祖先**。2018 年的 RNN 把历史压缩成隐状态逐步传递；2026 年的 LLM 把历史展开成上下文窗口逐个 token 预测。两者都坚信序列生成必须依赖此前内容，变化的是历史信息的访问方式——从「压缩摘要」到「全文索引」。

2. **LSTM 的门控机制没有被丢弃，而是被拆分和内化**。遗忘门、输入门、输出门的思想以 GLU/SwiGLU 的形式进入 Transformer 前馈层，以「选择性状态空间」的形式在 Mamba、RWKV、xLSTM 中复活。LSTM 作为一个完整架构被 Transformer 革命，但它的门控遗产仍是 LLM 信息路由的核心语法。

3. **LRCN 的「编码器-序列模型-解码器」结构是多模态 LLM 的史前形态**。2018 年用 Inception V3 提取帧特征、用 LSTM 建模时序、用分类器输出动作类别；2026 年用 CLIP/SigLIP 编码视觉、用 Transformer 统一多模态序列、用自回归生成输出任意文本。宏观骨架不变，只是每一块拼图都升级换代。

4. **Transformer 对 RNN 的替代不是「淘汰」，而是「新增维度」**。Self-Attention 为序列模型增加了全局关系建模的能力，使 RNN/LSTM 不再是唯一选择；但 RNN 的序列先验、参数效率和线性复杂度优势，正以状态空间模型（Mamba）和线性 Attention（RWKV）的形式重新参与 LLM 架构的竞争。

---

## 参考资源

- 原 Keynote：循环网络实战：视频动作识别，2018 年 6 月，baixiao
- 整理稿：`~/Documents/2026-07-22-视频动作识别-模型原理.md`
- 原博客文章（图片版）：[循环网络实战：视频动作识别](https://baixiaoustc.github.io/2018/06/13/tensorflow-with-rnn-ppt/)
- RNN 基础：Elman, J. L. (1990). *Finding Structure in Time*. Cognitive Science, 14(2), 179–211.
- LSTM：Hochreiter, S. & Schmidhuber, J. (1997). *Long Short-Term Memory*. Neural Computation, 9(8), 1735–1780.
- LRCN：Donahue, J. et al. (2015). *Long-term Recurrent Convolutional Networks for Visual Recognition and Description*. CVPR.
- Transformer：Vaswani, A. et al. (2017). *Attention Is All You Need*. NeurIPS.
- GLU：Dauphin, Y. N. et al. (2017). *Language Modeling with Gated Convolutional Networks*. ICML.
- SwiGLU：Shazeer, N. (2020). *GLU Variants Improve Transformer*. arXiv:2002.05202.
- CLIP：Radford, A. et al. (2021). *Learning Transferable Visual Models From Natural Language Supervision*. ICML.
- SigLIP：Zhai, X. et al. (2023). *Sigmoid Loss for Language Image Pre-Training*. ICCV.
- Mamba：Gu, A. & Dao, T. (2023). *Mamba: Linear-Time Sequence Modeling with Selective State Spaces*. arXiv:2312.00752.
- RWKV：Peng, B. et al. (2023). *RWKV: Reinventing RNNs for the Transformer Era*. arXiv:2305.13048.
- xLSTM：Beck, M. et al. (2024). *xLSTM: Extended Long Short-Term Memory*. arXiv:2405.04517.
- LLaVA：Liu, H. et al. (2023). *Visual Instruction Tuning*. NeurIPS.
- Video-LLaMA：Zhang, H. et al. (2023). *Video-LLaMA: An Instruction-tuned Audio-Visual Language Model for Video Understanding*. arXiv:2306.02858.
- 系列前几篇：
  - 第 1 篇：[从单层 softmax 到 LLM——回顾基础组件的拼图贡献](https://baixiaoustc.github.io/2026/05/24/from-softmax-to-llm/)
  - 第 2 篇：[从优化器选择到 LLM——回顾 Adam 的诞生与统治](https://baixiaoustc.github.io/2026/06/02/from-optimizer-to-llm/)
  - 第 3 篇：[从深层神经网络到 LLM——回顾激活函数与深度之路](https://baixiaoustc.github.io/2026/06/07/from-dnn-to-llm/)
  - 第 4 篇：[从 CNN 到 LLM——回顾卷积的遗产与技术拼图](https://baixiaoustc.github.io/2026/06/14/from-cnn-to-llm/)
  - 第 5 篇：[从强化学习到 LLM——回顾 RL 基础在 RLHF 时代的拼图位置](https://baixiaoustc.github.io/2026/06/21/from-rl-to-llm/)
  - 第 6 篇：[从 DQN 到 LLM——深度 Q 网络在智能体时代的拼图位置](https://baixiaoustc.github.io/2026/06/29/from-dqn-to-llm/)

---

*本文为「回顾 LLM 的基础」系列第 7 篇。下一篇将回顾视频动作识别的实战与对比——从 UCF101 训练流程到现代视频理解基准的迁移学习。*
