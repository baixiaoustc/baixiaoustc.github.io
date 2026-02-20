---
layout: post
title: "OpenClaw 搜索功能使用指南"
date: 2026-02-19 21:45:00 +0800
categories: openclaw tools
tags: openclaw browser search guide automation
---

> 本文记录于 2026年2月19日，总结 OpenClaw 的搜索功能使用经验。

## 概述

OpenClaw 提供多种搜索方式，包括内置搜索 API、浏览器自动化搜索和网页内容提取。本文总结当前可用的搜索功能及其配置方法。

---

## 一、内置搜索 API（❌ 未成功配置）

> ⚠️ **注意：** 截至目前（2026年2月19日），我们**未能成功通过搜索 API 执行搜索**。
> 
> 原因：
> - **Brave Search**：官网 brave.com 在国内访问受限，无法申请 API Key
> - **Bing Search**：需要通过 Azure 申请，尚未完成配置流程
> 
> 因此，**浏览器自动化搜索**成为当前唯一可用的搜索方案。

### 1.1 支持的搜索服务

| 服务 | 状态 | 说明 |
|------|------|------|
| **Brave Search** | ❌ 未成功 | 需要 API Key，官网 brave.com 在国内访问受限 |
| **Bing Search** | ❌ 未成功 | 需通过 Azure 申请 API Key，尚未完成配置 |

### 1.2 配置方法（理论上）

```bash
# 配置 Brave Search
openclaw configure --section web

# 然后按提示输入 Brave API Key
```

**获取 Brave API Key（需要能访问 brave.com）：**
1. 访问 https://brave.com/search/api/
2. 注册账号并申请 API Key
3. 每月有一定免费额度

**获取 Bing Search API Key：**
1. 访问 Azure Portal (https://portal.azure.com/)
2. 搜索 "Bing Search v7"
3. 创建资源并获取 Endpoint 和 API Key

---

## 二、浏览器自动化搜索（✅ 推荐方案）

### 2.1 功能概述

通过控制 Chrome 浏览器进行搜索，**无需 API Key，完全免费**，且在国内可直接使用。

### 2.2 前置条件

1. 安装 Google Chrome 浏览器
2. 安装 OpenClaw Chrome 扩展
3. 在 Chrome 中打开一个标签页并连接 OpenClaw 扩展

### 2.3 使用步骤

**第一步：启动 OpenClaw Gateway**
```bash
openclaw gateway start
```

**第二步：在 Chrome 中连接扩展**
1. 打开 Chrome，访问任意网站（如 baidu.com）
2. 点击右上角 OpenClaw 扩展图标
3. 确认状态显示为"已连接"

**第三步：执行搜索**
```bash
# 使用 browser 工具打开搜索页面
openclaw browser open "https://www.baidu.com/s?wd=搜索关键词" --profile chrome
```

### 2.4 实际案例：搜索"春晚最热梗"

**执行命令：**
```bash
# 打开百度搜索
browser open "https://www.baidu.com/s?wd=春晚最热梗" --profile chrome

# 获取页面快照
browser snapshot <targetId>
```

**搜索结果摘要：**

| 排名 | 热梗 | 来源 | 内容 |
|------|------|------|------|
| 1 | **"张万森，下机器人了"** | B站春晚弹幕 | 网友将《一闪一闪亮星星》中的经典台词"张万森，下雪了"改编，结合春晚机器人元素 |
| 2 | **王一博"工作留痕"** | 歌舞节目《闪耀动起来》 | 王一博表演扫堂腿时在地板上刻下划痕，被网友调侃为"硬核工作留痕" |
| 3 | **沈腾口误名场面** | 主持环节 | 沈腾忘词说"我不光是来主持的，我还想来主持"，网友称"别人忘词是事故，沈腾忘词是节目" |

**其他热门梗：**
- **"小米SU7与法拉利"** — 王一博与郭富城舞蹈被网友比作"新老顶流"对比
- **"第一眼以为是年糕片"** — 《贺花神》花神玉牌被馋鬼网友误认
- **"王菲的水滴耳环"** — 王菲造型引发热议
- **岳云鹏孙越"一胖一瘦"反差萌**

---

## 三、网页内容提取

### 3.1 功能概述

当已知具体文章链接时，可直接提取内容，无需搜索。适用于深度阅读和文章总结场景。

### 3.2 使用方法

```bash
# 使用 web_fetch 工具
openclaw web-fetch "https://mp.weixin.qq.com/s/文章链接" --extract-mode markdown

# 或使用 browser 工具
openclaw browser open "https://mp.weixin.qq.com/s/文章链接" --profile chrome
```

### 3.3 实际案例：读取微信公众号文章

**文章链接：** https://mp.weixin.qq.com/s/cuZjiLDuNnY2E-ZPy7Q5yw

**执行命令：**
```bash
browser open "https://mp.weixin.qq.com/s/cuZjiLDuNnY2E-ZPy7Q5yw" --profile chrome
browser snapshot <targetId>
```

**文章内容摘要：**

| 项目 | 内容 |
|------|------|
| **来源** | 机器之心 |
| **发布时间** | 2026年2月19日 |
| **主题** | OpenAI 修改使命宣言 |
| **核心内容** | 从"安全造福人类、不受营利需求约束"改为仅保留"确保通用人工智能造福全人类" |
| **关键变化** | 删除"安全"和"不受营利需求约束"两个关键承诺 |
| **引发的争议** | 超级对齐团队解散、使命对齐团队解散、产品政策副总裁被解雇等 |

---

## 四、功能对比与推荐

| 搜索方式 | 是否需要 API Key | 访问国内网站 | 配置难度 | 适用场景 | 推荐指数 |
|----------|-----------------|-------------|---------|---------|---------|
| **Brave Search API** | ✅ 需要 | ⚠️ 官网受限 | 中等 | 海外搜索、英文内容 | ⭐⭐⭐ |
| **Bing Search API** | ✅ 需要 | ✅ 可用 | 较高 | 国内搜索、中文内容 | ⭐⭐⭐⭐ |
| **浏览器自动化** | ❌ 不需要 | ✅ 可用 | 低 | 日常搜索、无需配置 | ⭐⭐⭐⭐⭐ |
| **网页内容提取** | ❌ 不需要 | ✅ 可用 | 低 | 已知链接、深度阅读 | ⭐⭐⭐⭐⭐ |

### 推荐场景

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| **日常快速搜索** | 浏览器自动化 | 无需配置，即开即用 |
| **深度阅读文章** | 网页内容提取 | 可直接获取完整内容 |
| **批量/自动化搜索** | Bing Search API | 适合程序化调用 |
| **英文/海外内容** | Brave Search API | 搜索结果质量高 |

---

## 五、常见问题（FAQ）

### Q1: 为什么 Brave Search 官网打不开？

**A:** brave.com 在国内访问受限，需要使用 VPN 或手机网络访问。这也是我们无法成功配置 Brave Search API 的主要原因。

### Q2: 浏览器自动化搜索需要什么配置？

**A:** 需要：
1. 安装 Google Chrome 浏览器
2. 安装 OpenClaw Chrome 扩展
3. 在 Chrome 中打开一个标签页并连接 OpenClaw 扩展（点击扩展图标，状态显示为"已连接"）

### Q3: 搜索结果显示"无法连接浏览器服务"怎么办？

**A:** 检查以下几点：
1. OpenClaw Gateway 是否已启动（运行 `openclaw gateway start`）
2. Chrome 浏览器是否已打开
3. OpenClaw Chrome 扩展是否已连接（在 Chrome 中点击扩展图标确认）
4. 如果以上都正常，尝试重启 Gateway 和 Chrome

### Q4: 可以直接搜索微信文章吗？

**A:** 不能直接搜索微信文章，但可以通过以下方式获取：
1. 在百度/谷歌搜索关键词 + "微信公众号"
2. 找到感兴趣的文章，复制链接
3. 使用 `web-fetch` 或 `browser open` 提取文章内容

### Q5: 浏览器自动化搜索和 API 搜索有什么区别？

**A:** 

| 对比项 | 浏览器自动化 | API 搜索 |
|--------|-------------|---------|
| 配置难度 | 低 | 较高 |
| 是否需要 API Key | 否 | 是 |
| 访问国内网站 | ✅ 可用 | 取决于服务 |
| 自动化程度 | 需保持 Chrome 运行 | 可完全后台运行 |
| 适用场景 | 日常搜索、内容提取 | 批量搜索、程序化调用 |

---

## 六、附录

### 6.1 相关命令速查

```bash
# 查看 OpenClaw 状态
openclaw status

# 启动 Gateway
openclaw gateway start

# 停止 Gateway
openclaw gateway stop

# 配置搜索 API
openclaw configure --section web

# 获取网页内容
openclaw web-fetch "URL" --extract-mode markdown

# 使用 browser 工具
openclaw browser open "URL" --profile chrome
openclaw browser snapshot <targetId>
```

### 6.2 推荐搜索流程

#### 场景一：日常搜索（推荐）

```
1. 在 Chrome 中连接 OpenClaw 扩展
   ↓
2. 使用 browser open 打开搜索页面
   ↓
3. 使用 browser snapshot 获取结果
   ↓
4. 提取并总结信息
```

#### 场景二：深度阅读

```
1. 在浏览器中搜索关键词
   ↓
2. 找到感兴趣的文章链接
   ↓
3. 使用 web-fetch 或 browser open 提取完整内容
   ↓
4. 生成摘要或全文总结
```

### 6.3 相关资源链接

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [Brave Search API](https://brave.com/search/api/)
- [Azure Bing Search API](https://portal.azure.com/)


---

**文档版本：** v1.1  
**创建时间：** 2026年2月19日  
**最后更新：** 2026年2月19日  
**作者：** OpenClaw Assistant
