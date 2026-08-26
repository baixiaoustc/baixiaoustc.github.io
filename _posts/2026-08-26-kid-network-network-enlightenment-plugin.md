---
layout: post
title: "kid-network：给小朋友的网络启蒙插件"
date: 2026-08-26 00:00:00 +0800
categories: deepseek harness plugin
tags: DeepSeek Harness kidlab 网络启蒙 Cordis 少儿编程 动态插件
---
# kid-network：给小朋友的网络启蒙插件

**日期**: 2026-08-26
**关键词**: DeepSeek Harness、Cordis 插件、kidlab 系列、少儿编程、网络启蒙、动态插件

## 核心结论（30秒速览）

- 我们为 kidlab 电脑启蒙系列开发了第三款插件 **kid-network**（`@kidlab/dsh-kid-network`），给小朋友讲「电脑怎么连上网、数据怎么去远方」这条故事线。
- 5 个工具全部**真执行命令**，覆盖网络身份、寻址、路径、测速、邻居设备，内置**防注入设计**（目标枚举→硬编码域名），全部免 sudo、零第三方依赖。
- 前端并行做了「🕊️ 信鸽邮局」**常驻动态卡片**，把网络数据讲成"信鸽送信"的故事，在 DSH Web GUI 里可视化展示，8 秒自动刷新。

## 正文内容

### 1. 背景与定位

kidlab 是我们的电脑启蒙插件系列，此前已有两款：讲编程的 kid-coder、讲电脑资源监控的 kid-sysmon。这次第三款 kid-network 补齐了「网络」这块拼图。

**关键洞察**：给小朋友讲网络，难点不是技术细节，而是把"看不见的数据"讲成"看得见的故事"。所以这一款的核心命题是——**这台电脑在网上是谁、数据怎么出发去远方、路上经过了谁**。

**与 kid-sysmon 的分工**：kid-sysmon 已覆盖「网络速率/流量」，所以 kid-network 不碰这个，聚焦身份 / 寻址 / 路径 / 测速 / 设备，避免功能重叠。

### 2. 5 个工具的设计与安全

| 工具 | 用途 | 核心命令（硬编码常量） |
|---|---|---|
| `net_my_identity` | 网络身份证+住址 | `ipconfig getifaddr` / `netstat -rn` / `scutil --dns` / `curl cip.cc` |
| `net_trace_trip` | 数据信旅行路径 | `traceroute -q 1 -m 15 -w 1 <host>`（目标枚举→常量域名） |
| `net_test_speed` | 实测下载网速 | `curl -w '%{speed_download}' speed.cloudflare.com/__down` |
| `net_who_is_home` | 局域网设备全家福 | `arp -a` |
| `net_dns` | 网址翻译官演示 | `dig +short <host>`（目标枚举→常量域名） |

**安全设计**是关键：`net_trace_trip` / `net_dns` 的"目标"用**枚举参数（baidu/taobao/aliyun/qq/bilibili）→ 硬编码域名常量**映射，小朋友只能在预设项里选，**绝不拼接自由输入**，从根上防注入。

所有命令**免 sudo、零第三方依赖**，单命令超时 + 失败只报一行不中断整体（沿用 kid-sysmon 的 `run`/`safe` 辅助）。

### 3. 验证过程

我们坚持「先探路、再开发」的顺序：

1. **命令可行性实测**：先确认普通用户能跑 `traceroute`（macOS 本机 OK，免 sudo）、`arp -a`（还能显示手机品牌名）、`dig +short`、`curl cip.cc`（返回成都·电信）；选国内可达站点保证演示跑得通。
2. **workspace 注册**：在 `pnpm-workspace.yaml` 加 workspace 引用，根 `package.json` 加 devDep，`pnpm install`。
3. **构建**：用二进制 `tsc` 跳过 install 校验。
4. **共享 profile 链接**：`ln -sfn` 到 `~/.dsh/profiles/node_modules/@kidlab/`，一个链接满足所有 profile。
5. **装载声明**：向 `~/.dsh/cordis.patch.yml` 追加 kid-network 段。
6. **冒烟测试**：先逻辑后真机，`net_my_identity` 拿到局域网/网关/DNS/公网，`net_dns` 解析出百度 IP，`net_who_is_home` 列出 8 台设备（含 vivo / 荣耀手机）。
7. **端到端真机验证**：headless 任务让模型调用 `net_my_identity`，成功拿到真实数据并用 8 岁童趣语言讲解。

### 4. 真机效果（示例输出节选）

模型对"想想"的讲解：

> 这台电脑住的小区门牌号 **192.168.101.21**，出门上网要经过门口保安 **192.168.101.1**，在网络上领的身份证是**四川成都 · 电信 · 125.71.134.44** 🏠🚪🌟

`net_who_is_home` 真实列出 `vivo-x200-pro-mini`、`rong-yaomagic-v-flip`（荣耀）、路由器 `router.ctc` 等，对"同一 WiFi 下有哪些设备"的讲解非常直观。

前端渲染卡片效果如下：

### 5. 前端常驻卡片：🕊️ 信鸽邮局

上面是前端对话流中嵌入的卡片。这次我们在 DSH Web GUI 渲染一张**常驻卡片**，把网络数据讲成"信鸽送信"的故事可视化展示。

**形态**：动态 Cordis Plugin（非 workspace 包，不编译不注册），`cordis/host.js` 用 `ctx.shell` 跑采集并注册私有 RPC `net:collect`，`cordis/client.js` 注册常驻 Slot，每 8 秒刷新。

**采集内容**：局域网门牌、网关、DNS、邻居设备数、公网 IP/城市/运营商、实测网速（转 MB/s）、到百度/阿里云/腾讯三站延迟（进度条：延迟越低条越满）。

#### 版本演进（pluginId `kid-2`）

| 包 | 里程碑 | 说明 |
|---|---|---|
| `pkg-2` | 首次定义并运行 | 注册在对话流 Slot，卡片随对话出现。 |
| `pkg-3` | 加宽（误伤） | 只带 client 半边改宽度，导致 host 的 `net:collect` 丢失，卡片失去真实数据。 |
| `pkg-4` | 修复 host | 同时带上未改动 host 半边 + 加宽 client 半边，恢复采集。 |
| `pkg-5` | 常驻化 | 注册目标迁移到输入条上方常驻的 `conversation.input.dock`，滚动不划走。 |
| `pkg-6` | 紧凑折叠 | 默认折叠成一行摘要，点击展开全部详情。 |
| `pkg-7` | 文案优化 | 延迟栏标题改为「✈️ 送信到三站 · 越快越好」。 |
| `pkg-8` | 去装饰 | 去掉遮挡内容的右下 🕊️ 装饰图标（保留右上 ☁️）。 |

**Slot 选择**：常驻效果用 `conversation.input.dock`（输入条上方一条全宽行，随输入区固定），而非 `conversation.composer.dock`（输入卡片内部窄列，放不下宽卡片）。选槽前先 `cordis_inspect_query` 读子树确认存在性与注册协议。

**出网降级**：host 采集对出网命令（curl）单独跑、失败置 `null` 不中断；被受限沙箱拦时前端显示「待联网确认」等占位，优雅降级。

最终效果：

点击唤起：

## 结论

kid-network 补齐了 kidlab 系列的"网络"故事线，让小朋友能直观看到：**自己的电脑在网上有身份证和住址，数据信要一站一站出发，家里还有哪些网络邻居**。

**行动建议**：
- 想复用的开发者，把「枚举参数→硬编码常量」的防注入模式沉淀为通用规范。
- 动态插件迭代时，把「双边一起提交」写进团队 checklist。
- 系列化开发时，直接复用第一款插件的骨架与验证流程，最稳也最快。

## 参考资源

- 开发记录原文：`~/Documents/2026-08-25-kid-network网络启蒙插件开发记录.md`
- 插件源码：`~/Code/deepseek-harness-dev/plugin-kid-network/`（`src/{index,config,tools}.ts` + `example/kid-network.cordis.yml`）
- 前端卡片源码：`plugin-kid-network/cordis/{host,client}.js`
- 系列 skill：kidlab-harness-plugin