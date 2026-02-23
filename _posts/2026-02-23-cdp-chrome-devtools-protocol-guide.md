---
layout: post
title: "CDP (Chrome DevTools Protocol) 完整指南：从原理到 OpenClaw 实践"
date: 2026-02-23 22:30:00 +0800
categories: technical browser automation
tags: cdh chrome-devtools-protocol browser-automation openclaw web-scraping
---

# CDP (Chrome DevTools Protocol) 完整指南

> 文档生成时间：2026年2月23日  
> 基于与 OpenClaw AI 助手的对话整理

---

## 目录

1. [CDP 是什么？](#1-cdp-是什么)
2. [CDP 完整架构](#2-cdp-完整架构)
3. [CDP 核心模块](#3-cdp-核心模块)
4. [targetId 详解](#4-targetid-详解)
5. [CDP 工作流程](#5-cdp-工作流程)
6. [CDP vs Browser Use vs Computer Use](#6-cdp-vs-browser-use-vs-computer-use)
7. [OpenClaw 中的实现](#7-openclaw-中的实现)
8. [实际代码示例](#8-实际代码示例)

---

## 1. CDP 是什么？

### 1.1 定义

**CDP（Chrome DevTools Protocol）** 是 Chrome/Chromium 浏览器提供的一套**远程调试协议**，基于 **WebSocket** 通信，允许外部程序远程控制浏览器。

### 1.2 核心特点

| 特性 | 说明 |
|------|------|
| **双向通信** | 既可以发送命令控制浏览器，也可以接收浏览器事件 |
| **WebSocket 传输** | 基于 WebSocket，实时、全双工 |
| **JSON 格式** | 命令和响应都是 JSON |
| **功能丰富** | 涵盖页面、网络、DOM、JavaScript、性能、安全等 |

### 1.3 CDP 与 Chrome 的关系

```
Chrome 开发者工具（DevTools UI）
           ↓
    CDP (WebSocket)
           ↓
    Chrome 浏览器内核
    (Blink + V8)
```

> **关键洞察**：Chrome DevTools 本身就是用 CDP 与浏览器通信的。CDP 暴露的是与 DevTools 相同的能力。

---

## 2. CDP 完整架构

### 2.1 分层架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层（Application Layer）                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Browser Use (浏览器使用)                    │  │
│  │     AI 控制浏览器：导航、点击、输入、提取数据等            │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │         CDP (Chrome DevTools Protocol)          │   │  │
│  │  │    底层协议：WebSocket 通信、命令执行、事件监听    │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ WebSocket 连接
┌─────────────────────────────────────────────────────────────┐
│              CDP 传输层（Transport Layer）                   │
│              ws://localhost:9222/json                       │
│         HTTP Endpoint for debugging protocol               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           CDP 会话层（Session Layer）                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │  Target │ │  Target │ │  Target │ │  Target │          │
│  │  ID: 1  │ │  ID: 2  │ │  ID: 3  │ │  ID: N  │          │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘          │
│       │           │           │           │                 │
│       └───────────┴───────────┴───────────┘                 │
│                       │                                     │
│              ┌────────┴────────┐                           │
│              │   CDP Domain    │                           │
│              │    Manager      │                           │
│              └────────┬────────┘                           │
└───────────────────────┼───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│           CDP 协议层（Protocol Layer）                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │  Page   │ │  DOM    │ │ Network │ │Runtime  │          │
│  │  Domain │ │ Domain  │ │ Domain  │ │ Domain  │          │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘          │
│       │           │           │           │                 │
│       └───────────┴───────────┴───────────┘                 │
│                       │                                     │
│              ┌────────┴────────┐                           │
│              │   Command     │                           │
│              │   Events      │                           │
│              │   (JSON-RPC)  │                           │
│              └────────┬────────┘                           │
└───────────────────────┼───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Chrome / Chromium 浏览器内核                         │
│         Blink 渲染引擎 + V8 JavaScript 引擎                │
│              │         │         │         │                 │
│              ▼         ▼         ▼         ▼                 │
│           ┌────┐   ┌────┐   ┌────┐   ┌────┐               │
│           │Render│   │Network│   │JS     │   │Storage │               │
│           │Process│   │Stack │   │Engine │   │Layer   │               │
│           └────┘   └────┘   └────┘   └────┘               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 各层职责

| 层级 | 职责 | 代表组件 |
|------|------|----------|
| **应用层** | 提供高级 API 供开发者使用 | Playwright、Puppeteer、OpenClaw |
| **传输层** | 建立 WebSocket 连接 | `ws://localhost:9222` |
| **会话层** | 管理多个 Target 的会话 | Target.attachToTarget |
| **协议层** | 定义各种 Domain 和命令 | Page、DOM、Network、Runtime |
| **内核层** | 实际执行命令 | Blink + V8 |

---

## 3. CDP 核心模块

### 3.1 Domain 分类

| Domain | 功能描述 | 常用命令 |
|--------|----------|----------|
| **Page** | 页面导航、截图、PDF | `Page.navigate`, `Page.reload`, `Page.captureScreenshot` |
| **DOM** | DOM 树操作、元素查找 | `DOM.querySelector`, `DOM.getDocument`, `DOM.setAttributeValue` |
| **Runtime** | JavaScript 执行 | `Runtime.evaluate`, `Runtime.callFunctionOn`, `Runtime.getProperties` |
| **Network** | 网络请求拦截 | `Network.enable`, `Network.getResponseBody`, `Network.setRequestInterception` |
| **Input** | 模拟用户输入 | `Input.dispatchMouseEvent`, `Input.dispatchKeyEvent` |
| **Console** | 控制台消息 | `Console.enable`, `Console.clearMessages` |
| **Performance** | 性能分析 | `Performance.enable`, `Performance.getMetrics` |
| **Security** | 安全相关 | `Security.enable`, `Security.setIgnoreCertificateErrors` |

### 3.2 Domain 使用示例

```javascript
// Page Domain - 导航到 URL
{
  "id": 1,
  "method": "Page.navigate",
  "params": {
    "url": "https://example.com"
  }
}

// DOM Domain - 查询元素
{
  "id": 2,
  "method": "DOM.querySelector",
  "params": {
    "nodeId": 1,
    "selector": "#submit-button"
  }
}

// Runtime Domain - 执行 JavaScript
{
  "id": 3,
  "method": "Runtime.evaluate",
  "params": {
    "expression": "document.title",
    "returnByValue": true
  }
}

// Network Domain - 启用网络监控
{
  "id": 4,
  "method": "Network.enable",
  "params": {
    "maxTotalBufferSize": 10000000,
    "maxResourceBufferSize": 5000000
  }
}
```

---

## 4. targetId 详解

### 4.1 什么是 targetId？

**targetId** 是 CDP 中用于**唯一标识一个可调试目标**的字符串。它是 Chrome 浏览器自动生成的 UUID。

### 4.2 Target 的类型

在 Chrome 中，以下都是 Target：

| 类型 | 说明 | 示例 |
|------|------|------|
| **page** | 普通网页标签页 | 你浏览的网页 |
| **iframe** | 嵌入的框架 | 页面中的 `<iframe>` |
| **service_worker** | 服务工作线程 | PWA 的后台脚本 |
| **shared_worker** | 共享工作线程 | 多页面共享的 JS 线程 |
| **background_page** | 扩展后台页 | Chrome 扩展的后台 |
| **browser** | 浏览器实例 | 整个浏览器 |

### 4.3 targetId 的生命周期

```
┌─────────────────────────────────────────────────────────┐
│                    Target 生命周期                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  创建                                                    │
│    │                                                     │
│    ▼                                                     │
│  Chrome 生成 UUID                                        │
│    │                                                     │
│    ▼                                                     │
│  分配给 Target (page/iframe/worker)                     │
│    │                                                     │
│    ▼                                                     │
│  可以通过 CDP 发现和操作                                 │
│    │                                                     │
│    ▼                                                     │
│  直到 Target 被销毁 (关闭标签页/iframe 卸载等)           │
│    │                                                     │
│    ▼                                                     │
│  targetId 失效                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.4 targetId 在 OpenClaw 中的使用

```bash
# Step 1: 打开一个网页，获取 targetId
browser open https://example.com
# 返回值:
# {
#   "targetId": "33332FA38DF511A9519E3A7C6E1740E2",
#   "title": "Example Domain",
#   "url": "https://example.com"
# }

# Step 2: 使用同一个 targetId 执行后续操作
browser snapshot --targetId=33332FA38DF511A9519E3A7C6E1740E2
browser click --targetId=33332FA38DF511A9519E3A7C6E1740E2 --selector="#button"

# Step 3: 导航到新 URL（在同一个 targetId 上）
browser navigate --targetId=33332FA38DF511A9519E3A7C6E1740E2 --url=https://another.com
# 注意: 这会覆盖原页面，targetId 不变
```

### 4.5 多个 targetId 的管理

```javascript
// 场景: 同时管理多个标签页
const targets = new Map();

// 打开第一个页面
const target1 = await browser.open('https://page1.com');
targets.set('page1', target1.targetId);
// targetId: "ABC123..."

// 打开第二个页面
const target2 = await browser.open('https://page2.com');
targets.set('page2', target2.targetId);
// targetId: "DEF456..."

// 分别操作不同的页面
await browser.snapshot({ targetId: targets.get('page1') });
await browser.snapshot({ targetId: targets.get('page2') });
```

---

## 5. CDP 工作流程

### 5.1 完整流程示例

```javascript
// Step 1: 连接到 Chrome CDP
const ws = new WebSocket('ws://localhost:9222/devtools/browser');

// Step 2: 创建新 Target（标签页）
ws.send(JSON.stringify({
  id: 1,
  method: 'Target.createTarget',
  params: { url: 'about:blank' }
}));

// 响应:
// { "id": 1, "result": { "targetId": "ABC123..." } }

// Step 3: 附加到 Target
ws.send(JSON.stringify({
  id: 2,
  method: 'Target.attachToTarget',
  params: { targetId: 'ABC123...', flatten: true }
}));

// 响应:
// { "id": 2, "result": { "sessionId": "session-xyz..." } }

// Step 4: 使用 session 发送命令
// 导航到 URL
ws.send(JSON.stringify({
  id: 3,
  method: 'Page.navigate',
  params: { url: 'https://example.com' },
  sessionId: 'session-xyz...'
}));

// Step 5: 监听事件
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.method === 'Page.loadEventFired') {
    console.log('页面加载完成！');
    
    // Step 6: 执行 JavaScript
    ws.send(JSON.stringify({
      id: 4,
      method: 'Runtime.evaluate',
      params: { expression: 'document.title' },
      sessionId: 'session-xyz...'
    }));
  }
};
```

### 5.2 命令与事件的对应关系

```javascript
// 发送命令 (Command)
{
  "id": 1,                          // 客户端生成的唯一 ID
  "method": "Page.navigate",       // Domain.Command
  "params": {                       // 命令参数
    "url": "https://example.com"
  }
}

// 接收响应 (Response)
{
  "id": 1,                          // 对应请求的 ID
  "result": {                       // 成功结果
    "frameId": "frame-123",
    "loaderId": "loader-456"
  }
  // 或错误:
  // "error": { "code": -32601, "message": "Method not found" }
}

// 接收事件 (Event) - 服务器主动推送
{
  "method": "Page.loadEventFired",   // Domain.eventName
  "params": {                       // 事件参数
    "timestamp": 1234567890.123
  }
}
```

---

## 6. CDP vs Browser Use vs Computer Use

### 6.1 概念对比

| 概念 | 定义 | 层级 | 类比 |
|------|------|------|------|
| **CDP** | Chrome DevTools Protocol，浏览器控制协议 | **底层协议** | 像 "HTTP 协议" |
| **Browser Use** | 使用 CDP 控制浏览器完成网页任务 | **中层能力** | 像 "浏览器自动化工具" |
| **Computer Use** | AI 控制整个计算机（包括浏览器、文件、应用等） | **上层能力** | 像 "智能体助手" |

### 6.2 架构关系

```
┌─────────────────────────────────────────────────────────────┐
│                    Computer Use (计算机使用)                    │
│    AI 控制整个操作系统：浏览器、文件系统、应用程序、终端等         │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Browser Use (浏览器使用)                    │  │
│  │     AI 控制浏览器：导航、点击、输入、提取数据等            │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │         CDP (Chrome DevTools Protocol)          │   │  │
│  │  │    底层协议：WebSocket 通信、命令执行、事件监听    │   │  │
│  │  │                                                   │   │  │
│  │  │  ┌───────────────────────────────────────────┐   │   │  │
│  │  │  │     Chrome / Chromium 浏览器内核           │   │   │  │
│  │  │  │         Blink + V8 引擎                   │   │   │  │
│  │  │  └───────────────────────────────────────────┘   │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 实际应用对比

| 技术 | 使用场景 | 实例 |
|------|----------|------|
| **CDP** | 浏览器自动化基础设施 | Selenium 4、Chrome DevTools、OpenClaw browser |
| **Browser Use** | AI 完成网页任务 | 自动填表、数据采集、网页测试、OpenClaw 自动化 |
| **Computer Use** | AI 控制整个电脑 | OpenAI Operator、Claude Computer Use、智能体任务 |

---

## 7. OpenClaw 中的实现

### 7.1 OpenClaw 架构

#### 7.1.1 完整架构图

```
┌─────────────────────────────────────────────────┐
│  OpenClaw Agent (你正在对话的 AI)                 │
│  使用 browser 工具进行调用                         │
└────────────────────────┬────────────────────────┘
                         │
┌────────────────────────▼────────────────────────┐
│  OpenClaw Gateway                              │
│  管理 CDP 连接，提供 browser API               │
│  HTTP: http://127.0.0.1:18792/json             │
└────────────────────────┬────────────────────────┘
                         │ WebSocket (ws://127.0.0.1:18792/cdp)
┌────────────────────────▼────────────────────────┐
│  🔷 OpenClaw Browser Relay 🔷                  │
│  核心转发组件，连接 Gateway 与 Chrome Extension  │
│  • 建立 WebSocket 服务器                       │
│  • 接收来自 Chrome 扩展的 CDP 消息              │
│  • 将消息转发给 Gateway                         │
│  • 将 Gateway 响应回传给 Chrome 扩展          │
└────────────────────────┬────────────────────────┘
                         │ WebSocket (Chrome Extension 连接)
┌────────────────────────▼────────────────────────┐
│  Chrome Extension (你点击连接的扩展)            │
│  在 Chrome 中运行，与 Browser Relay 建立 WebSocket │
│  • 注入到 Chrome DevTools 协议层                 │
│  • 捕获 CDP 消息并转发给 Relay                   │
│  • 接收 Relay 命令并执行在浏览器中               │
└────────────────────────┬────────────────────────┘
                         │ Chrome DevTools Protocol
┌────────────────────────▼────────────────────────┐
│  Chrome DevTools Protocol (CDP)                 │
│  浏览器原生协议，控制和监听浏览器                 │
└────────────────────────┬────────────────────────┘
                         │
┌────────────────────────▼────────────────────────┐
│  Chrome / Chromium 浏览器内核                    │
│  Blink 渲染引擎 + V8 JavaScript 引擎             │
└─────────────────────────────────────────────────┘
```

#### 7.1.2 OpenClaw Browser Relay 详解

**什么是 Browser Relay？**

`OpenClaw Browser Relay` 是 OpenClaw 架构中的**核心桥梁组件**，它负责在 **OpenClaw Gateway** 和 **Chrome Extension** 之间建立双向 WebSocket 连接，实现 CDP 消息的中转和转发。

**Browser Relay 的核心职责：**

| 职责 | 说明 |
|------|------|
| **WebSocket 服务器** | 在本地启动 WebSocket 服务（默认端口 18792），等待 Chrome 扩展连接 |
| **消息转发** | 接收来自 Chrome 扩展的 CDP 消息，转发给 OpenClaw Gateway |
| **响应回传** | 接收 Gateway 的响应，回传给 Chrome 扩展 |
| **连接管理** | 维护多个 Chrome 标签页的 Target 连接，处理连接断开和重连 |

**Browser Relay 的工作流程：**

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  OpenClaw Agent │────▶│  OpenClaw Gateway │────▶│  Browser Relay  │
│  (发送命令)      │     │  (管理 CDP 会话)  │     │  (WebSocket 服务器)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                                                           ▼ WebSocket
                                                   ┌─────────────────┐
                                                   │  Chrome Extension│
                                                   │  (注入到 DevTools)│
                                                   └─────────────────┘
                                                           │
                                                           ▼ CDP
                                                   ┌─────────────────┐
                                                   │  Chrome 浏览器   │
                                                   └─────────────────┘
```

**为什么需要 Browser Relay？**

1. **跨进程通信**：Chrome 扩展运行在一个独立的进程中，需要通过 WebSocket 与 OpenClaw Gateway 通信
2. **多标签页管理**：一个 Chrome 窗口可能有多个标签页，Browser Relay 负责管理多个 Target 连接
3. **消息转发和中转**：CDP 消息格式复杂，Browser Relay 负责解析和转发
4. **连接稳定性**：处理网络波动、Chrome 崩溃等异常情况，提供重连机制

**故障排查：Browser Relay 相关问题**

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| "Chrome extension relay is running, but no tab is connected" | Browser Relay 已启动，但 Chrome 扩展未连接 | 在 Chrome 中点击 OpenClaw 扩展图标，建立连接 |
| "Can't reach the OpenClaw browser control service" | Browser Relay 或 Gateway 未启动 | 检查 `openclaw gateway status`，确保 Gateway 在运行 |
| 连接频繁断开 | 网络不稳定或 Chrome 休眠 | 检查 Mac 电源设置，确保 Chrome 不被挂起 |
| 多个标签页无法同时控制 | Browser Relay 的 Target 管理问题 | 确保每个 `browser open` 都返回了不同的 targetId |

**总结：**

`OpenClaw Browser Relay` 是整个 OpenClaw 浏览器自动化架构的**核心枢纽**，它负责：
- 建立和维护 Gateway 与 Chrome 扩展之间的 WebSocket 连接
- 转发 CDP 命令和响应
- 管理多个浏览器标签页的 Target 会话

没有 Browser Relay，OpenClaw 就无法实现与 Chrome 浏览器的 CDP 通信，整个浏览器自动化流程就无法工作。

### 7.2 OpenClaw browser 命令

```bash
# 1. 打开网页，获取 targetId
browser open https://example.com
# 返回: { "targetId": "33332FA38DF511A9519E3A7C6E1740E2", ... }

# 2. 使用 targetId 进行后续操作
browser snapshot --targetId=33332FA38DF511A9519E3A7C6E1740E2
browser click --targetId=33332FA38DF511A9519E3A7C6E1740E2 --selector="#button"
browser type --targetId=33332FA38DF511A9519E3A7C6E1740E2 --selector="#input" --text="hello"

# 3. 导航到新 URL（在同一个 targetId 上）
browser navigate --targetId=33332FA38DF511A9519E3A7C6E1740E2 --url=https://another.com
# 注意: 这会覆盖原页面，targetId 不变
```

---

## 8. 实际代码示例

### 8.1 完整的 CDP 会话流程

```javascript
const WebSocket = require('ws');

// Step 1: 获取可用的调试目标
async function getDebuggingTargets() {
  const response = await fetch('http://localhost:9222/json/list');
  return await response.json();
}

// Step 2: 连接到指定目标
async function connectToTarget(targetId) {
  // 获取 WebSocket URL
  const targets = await getDebuggingTargets();
  const target = targets.find(t => t.id === targetId);
  
  if (!target) {
    throw new Error(`Target ${targetId} not found`);
  }
  
  // 建立 WebSocket 连接
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  
  return new Promise((resolve, reject) => {
    ws.on('open', () => {
      console.log('CDP 连接已建立');
      resolve(ws);
    });
    
    ws.on('error', reject);
  });
}

// Step 3: 发送 CDP 命令
function sendCommand(ws, method, params = {}) {
  const command = {
    id: Math.floor(Math.random() * 1000000),
    method,
    params
  };
  
  return new Promise((resolve, reject) => {
    const handler = (event) => {
      const message = JSON.parse(event.data);
      
      // 匹配响应 ID
      if (message.id === command.id) {
        ws.off('message', handler);
        
        if (message.error) {
          reject(message.error);
        } else {
          resolve(message.result);
        }
      }
    };
    
    ws.on('message', handler);
    ws.send(JSON.stringify(command));
  });
}

// Step 4: 监听 CDP 事件
function onEvent(ws, eventName, callback) {
  const handler = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.method === eventName) {
      callback(message.params);
    }
  };
  
  ws.on('message', handler);
  
  // 返回取消监听函数
  return () => ws.off('message', handler);
}

// ===== 完整使用示例 =====

async function main() {
  try {
    // 1. 列出所有可用的目标
    console.log('获取可用目标...');
    const targets = await getDebuggingTargets();
    console.log(`找到 ${targets.length} 个目标`);
    
    // 2. 选择第一个目标（通常是当前活动的标签页）
    const target = targets[0];
    console.log(`连接到目标: ${target.title} (${target.url})`);
    
    // 3. 建立 WebSocket 连接
    const ws = await connectToTarget(target.id);
    
    // 4. 启用需要的 Domain
    await sendCommand(ws, 'Page.enable');
    await sendCommand(ws, 'Runtime.enable');
    await sendCommand(ws, 'DOM.enable');
    
    // 5. 监听页面加载事件
    onEvent(ws, 'Page.loadEventFired', async () => {
      console.log('页面加载完成！');
      
      // 执行 JavaScript 获取页面标题
      const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: 'document.title',
        returnByValue: true
      });
      
      console.log('页面标题:', result.result.value);
    });
    
    // 6. 导航到新 URL
    console.log('导航到 example.com...');
    await sendCommand(ws, 'Page.navigate', {
      url: 'https://example.com'
    });
    
    // 7. 等待一段时间后关闭连接
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('关闭连接');
    ws.close();
    
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 运行示例
main();
```

### 8.2 OpenClaw 中的 browser 工具使用

```bash
# ===== 基本命令示例 =====

# 1. 打开网页
browser open https://example.com
# 返回: { "targetId": "abc123...", "title": "Example", "url": "..." }

# 2. 获取页面快照（HTML 结构）
browser snapshot --targetId=abc123...

# 3. 点击元素
browser click --targetId=abc123... --selector="#submit-button"

# 4. 输入文本
browser type --targetId=abc123... --selector="#username" --text="myusername"

# 5. 导航到新 URL（在同一个 targetId 上）
browser navigate --targetId=abc123... --url=https://another.com

# 6. 截图
browser screenshot --targetId=abc123... --fullPage=true

# 7. 执行 JavaScript
browser evaluate --targetId=abc123... --script="document.title"

# 8. 关闭标签页
browser close --targetId=abc123...
```

---

## 9. 总结

### 9.1 核心概念回顾

| 概念 | 一句话解释 |
|------|-----------|
| **CDP** | Chrome 浏览器的远程控制协议 |
| **WebSocket** | CDP 的传输层通信方式 |
| **Domain** | CDP 的功能模块分类（Page、DOM、Runtime等） |
| **Command** | 向浏览器发送的指令 |
| **Event** | 浏览器主动推送的通知 |
| **Target** | 可调试的目标（标签页、iframe等） |
| **targetId** | 唯一标识一个 Target 的 ID |
| **Session** | 与特定 Target 的通信会话 |

### 9.2 使用场景选择

| 场景 | 推荐工具 |
|------|---------|
| 简单的网页自动化 | Selenium 4、Chrome DevTools |
| 需要与 AI 集成的浏览器控制 | OpenClaw browser 工具 |
| 完整的计算机控制（包括浏览器） | Computer Use (Claude / OpenAI Operator) |
| 底层浏览器调试和研究 | 直接使用 CDP |

### 9.3 学习路径建议

```
第一阶段: 了解概念
    ↓
阅读本文档 → 理解 CDP、Browser Use、Computer Use 的关系

第二阶段: 实践操作
    ↓
使用 OpenClaw browser 工具 → 体验高层抽象

第三阶段: 深入原理
    ↓
学习 Playwright/Puppeteer 源码 → 了解如何使用 CDP

第四阶段: 底层掌握
    ↓
直接使用 CDP WebSocket → 完整控制浏览器
```

---

## 附录

### A. 参考资源

- [Chrome DevTools Protocol 官方文档](https://chromedevtools.github.io/devtools-protocol/)
- [Playwright 文档](https://playwright.dev/)
- [Puppeteer 文档](https://pptr.dev/)
- [OpenClaw 文档](https://docs.openclaw.ai/)

### B. 术语表

| 术语 | 英文 | 解释 |
|------|------|------|
| CDP | Chrome DevTools Protocol | Chrome 开发者工具协议 |
| WebSocket | WebSocket | 全双工通信协议 |
| Target | Target | CDP 中的可调试目标 |
| Domain | Domain | CDP 的功能模块 |
| Session | Session | CDP 会话 |
| Browser Use | Browser Use | 浏览器使用能力 |
| Computer Use | Computer Use | 计算机使用能力 |

---

*文档结束*
