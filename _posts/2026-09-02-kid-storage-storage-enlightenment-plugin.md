---
layout: post
title: "kid-storage：给小朋友的存储启蒙插件"
date: 2026-09-02 00:00:00 +0800
categories: deepseek harness plugin
tags: DeepSeek Harness kidlab 存储启蒙 Cordis 少儿编程 动态插件 APFS
---
# kid-storage：给小朋友的存储启蒙插件

**关键词**: DeepSeek Harness、Cordis 插件、kidlab 系列、少儿编程、存储启蒙、动态插件、APFS

## 核心结论（30秒速览）

- 我们为 kidlab 电脑启蒙系列开发了第四款插件 **kid-storage**（`@kidlab/dsh-kid-storage`），给小朋友讲「电脑的东西都装在哪个大仓库、还能装多少」这条故事线。
- 3 个工具全部**真执行命令**，覆盖分区全景、主目录占用、大件行李排行，只扫用户可控目录（跳过 Library）、免 sudo、零第三方依赖。
- 前端并行做了「🧳 仓库大管家」**常驻可折叠卡片**，把硬盘空间讲成"大仓库 / 大行李箱"的故事；在 harness Web 创造模式实跑中踩透了 **APFS 分区口径** 与 **`<span>` inline 百分比宽度失效**两个硬坑。

## 正文内容

### 1. 背景与定位

kidlab 是我们的电脑启蒙插件系列，此前已有三款：讲编程的 kid-coder、讲资源监控的 kid-sysmon、讲网络的 kid-network。这次第四款 kid-storage 补齐了「存储」这块拼图。

**关键洞察**：给小朋友讲存储，最难的不是"磁盘满了"这个结论，而是讲清"东西都存在哪、哪个格子还剩空位"这种空间关系。所以这一款的核心命题是——**这台电脑的"大仓库"长什么样、谁占地方、还装得下新玩具吗**。

**与 kid-sysmon 的分工**：kid-sysmon 已有磁盘用量一栏，但只是 `df -h /` 的根分区一行；kid-storage 把它展开成一个完整故事线：分区全景 → 主目录占用榜 → 大件行李 Top。

### 2. 3 个工具的设计与安全

| 工具 | 小朋友视角的问题 | 核心命令（硬编码常量） |
|---|---|---|
| `storage_boxes` | 大仓库有几个格子、各能装/还剩多少 | `df -k -H` 解析分区，讲「根卷还剩 X」 |
| `storage_home` | "我的家"里谁最占地方 | 枚举常见子文件夹，逐个 `du -sk -x` + 数字降序 |
| `storage_heavy` | 最重的大件行李 Top12 | 各常见目录下一层 `du -d 1 -k` + `sort -rn` |

**安全与稳性设计**贯彻始终：只**枚举用户可控子文件夹**（Desktop/Documents/Downloads/Movies/Music/Pictures/Public，跳过 Library），既避开了 macOS 沙箱对照片图库等的拒绝，也避免 `du` 全盘深扫拖慢整体；命令全部**硬编码常量、不拼接用户输入**，免 sudo、零第三方依赖，单命令超时 + 失败只报一行（沿用系列的 `run`/`safe` 辅助）。

### 3. 存储类命令的三个坑（已回填 gotchas.md）

这套工具真正的难点不在功能，而在 macOS 的 BSD 工具行为。我们踩了三个，逐一拆解：

1. **`du -s` 与 `-d` 互斥**：`du -d 1 -sk` 里的 `-s`（summarize，等价 `-d 0`）会压掉 `-d 1`，结果**输出为空**。要看子目录层得用 `du -d 1 -k`。
2. **`sort -rh` 依赖 GNU 扩展**：macOS 自带 BSD `sort` 的 `-h` 不是人类可读排序。排占用榜用纯数字 `sort -rn`（配合 `du -k` 的 KB 数字列）最稳。
3. **别扫整棵 `$HOME`**：`du -d 2 ~` 会把巨大的 Library 也算进去，极慢且触发沙箱拒绝（`Operation not permitted`，如照片图库/MobileSync）。只枚举常见子文件夹逐个 `du -sk -x`。

**顺带修复的历史遗留**：`pnpm-workspace.yaml` 仍指向旧目录 `plugin-mac-sysmon`（上轮 mac-sysmon→kid-sysmon 重命名的遗漏），一并改成 `plugin-kid-sysmon`，并清掉 install 残留的 `dsh-mac-sysmon` devDep。

### 4. 验证过程

沿用系列的「先探路、再开发」顺序：workspace 注册 → `pnpm install` → 二进制 `tsc` 构建（TS2688 是已知兄弟目录 @types/node 告警，不影响 emit）→ 共享 profile symlink → `cordis.patch.yml` 装载声明 → `--dump-config` 验证无 "Cannot find package" → headless 端到端真机验证。

端到端真机结果：模型成功调用 `storage_boxes` + `storage_home`，输出——

> 这台电脑整个仓库（硬盘）总共能装 **121G**，但"我们家"（数据区）已经放满 **96%**，还剩约 **4.7G**，大约还能放 **4 集高清动画片** 或 **1200 张照片**。最占地方的是 **下载区 2.2G** 和 **音乐 1.1G**。

### 5. 前端常驻卡片：🧳 仓库大管家

我们在 harness Web 上以**动态 Cordis 插件**方式跑了一张**常驻可折叠卡片**：顶部系统盘剩余空间仪表条（已用% + 还可放多少），分区格子列表，主目录占用排行条；默认折叠成一行摘要、点标题展开/收起（复用 kid-network 的 `expanded` state 交互），每 8 秒自动刷新。

**采集**：`host.js` 注册私有 RPC `storage:collect`，`ctx.shell` 采集分区全景 + 主目录占用榜；client 挂到 `conversation.input.dock` 常驻槽。

#### 实跑调试：4 轮迭代（pluginId `kstor-3`）

| 包 | 解决 | 说明 |
|---|---|---|
| `pkg-9` | 首次跑通 | host+client 直接注册、`cordis_run` 激活，走双确认授权。 |
| `pkg-10` | APFS 分区口径 | 修复重复又矛盾的"系统盘/数据区"格子。 |
| `pkg-11` | 对数刻度 | 线性比例下小文件夹被钳到最小 4%，横条都一样短。 |
| `pkg-12` | block 级横条 | 真正修复 `width:%` 失效，横条终于有长有短。 |

#### 坑 A：APFS 分区"看着不对"（pkg-10）

卡片上「系统盘 /」「数据区 Data」出现两个格子，都显示总 121G、可用 4.7G，但已用一个 67%、一个 96%——**重复又矛盾**。

**根因**：macOS 的 APFS 是**同容器多挂载点**。挂到 `/` 的是**只读系统快照卷**，与 `/System/Volumes/Data` 共享同一块物理磁盘（同一容器 → 同样的 `size`/`avail`），所以 df 里两者报的总/剩余都一样，而"已用%"又各算各的。

**修复**：跳过挂到 `/` 的根卷快照，把 `/System/Volumes/Data` 数据卷作为"系统盘"头条（真实已用 96%、剩 4.7G）。
**关键洞察**：**macOS 别把 df 的根 `/` 挂载点当"系统盘"**，那只是只读快照卷；要看真实占用主体，看 Data 卷。

#### 坑 B：横条"都一样长"（pkg-11 → pkg-12，真正的坑）

占用榜里 下载 2.1G vs 桌面 8KB 相差 5 个数量级，但横条看不出差别。

- 第一层：线性比例 `kb/max*100` 下，所有小文件夹被 `Math.max(4,…)` 钳到最小 4% → 看着一样短。**对策**：改**对数刻度**（`logW`：最小 6%、最大 100%，中间按 log 拉伸）。
- 但改完**仍然全部一样长**——这才是最坑的一层：`.fill` 是 `<span>`（**inline 元素**），对 inline 元素设百分比 `width` **无效**，浏览器把轨道撑成满宽。

**真正修复（pkg-12）**：
- `.fill` 设 `display:block`（百分比宽度才生效）；
- 轨道 `.bar` 设 `display:flex; flex:1`（按 flex 容器宽度算百分比）；
- 名称/数值列 `flex:none`、轨道 `flex:1 1 0%; min-width:0`，保证轨道真实伸缩。

结果：横条终于有长有短（约 6%~100% 的对数分布），同时保留精确 GB/MB 数值标注。
**关键洞察**：前端进度条/仪表条**一定要用 block 级元素承载百分比宽度**，`<span>` inline 会静默失效——不报错、只是视觉全满，极难一眼发现。

### 6. 验证状态

- ✅ `tsc` 构建、`--dump-config` 装载、headless 端到端真机验证
- ✅ 前后端 JS 语法 precheck
- ✅ harness Web 创造模式实跑：分区、外挂盘、主目录占用榜全部有真实值，未触发沙箱占位
- ✅ 当前运行包 `kstor-3 / pkg-12`（state=running）：Data 卷作头条、对数刻度 + block 级横条 + 8 秒刷新 + 折叠/展开

## 结论

kid-storage 补齐了 kidlab 系列的"存储"故事线，让小朋友能直观看到：**电脑的"大仓库"分成了哪些格子、还剩多少空位、哪件"大行李"最占地方**。同时，它在一次次踩坑中沉淀了两条可复用教训。

**行动建议**：
- **macOS 取磁盘数据，认 `/System/Volumes/Data`，别认根 `/` 快照卷**。
- **前端仪表条/进度条，一律用 block 级元素承载百分比宽度**，并对跨数量级数据用对数刻度。
- 想复用整套存储查询命令的，直接看 gotchas.md 的 du/df 三坑清单。

## 参考资源

- 开发记录原文：`~/Documents/2026-09-02-kid-storage存储启蒙插件开发记录.md`
- 插件源码：`~/Code/deepseek-harness-dev/plugin-kid-storage/`（`src/{index,config,tools}.ts` + `cordis/`）
- 前端卡片源码：`plugin-kid-storage/cordis/{host,client}.js`（含一键激活 `activate.md`）
- 系列 skill：kidlab-harness-plugin（gotchas.md 已回填本次三坑）