---
author: baixiaoustc
comments: false
date: 2026-02-17 19:15:00+08:00
layout: post
slug: openclaw-feishu-guide
title: OpenClaw 火山引擎 + 飞书配置完整记录
categories:
- 技术
tags:
- OpenClaw
- 飞书
- 火山引擎
---

* content 
{:toc}

## 任务概述

**目标**：配置 OpenClaw 使用火山引擎 Coding Plan，并通过飞书在手机上使用。

**环境**：
- macOS
- Node.js 22.22.0
- OpenClaw 2026.2.13
- 火山引擎 Coding Plan (kimi-k2.5)

**最终状态**：✅ 飞书 Channel 已打通，可在手机飞书 App 中使用

---

## 第一阶段：火山引擎 Coding Plan 配置

### 1.1 配置 OpenClaw 模型

编辑 `~/.openclaw/openclaw.json`：

```json
{
  "models": {
    "providers": {
      "volcengine": {
        "baseURL": "https://ark.cn-beijing.volces.com/api/coding",
        "apiKey": "your-api-key",
        "models": {
          "ark-code-latest": {
            "enabled": true,
            "alias": "volcengine"
          }
        }
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "volcengine/ark-code-latest"
      }
    }
  }
}
```

### 1.2 验证模型调用

命令行测试：

```bash
openclaw agent --agent main --message "你好" --local
```

✅ **成功**：模型返回正常响应

---

## 第二阶段：Web UI 问题

### 2.1 问题描述

- `openclaw dashboard` 可以打开浏览器
- 但 Chat 界面发送消息无响应
- 浏览器 Console 无错误，但消息无法发送

### 2.2 原因分析

- Chrome 版本 116.0.0.0 过老（2023 年版本）
- Web UI 可能需要更新的浏览器功能
- 飞书插件缺少依赖 `@sinclair/typebox`

### 2.3 解决方案

由于 Web UI 无法使用，转而使用：
1. **命令行**：`openclaw agent --agent main --message "xxx"`
2. **飞书**：配置飞书 Channel 后在手机端使用

---

## 第三阶段：飞书 Channel 配置

### 3.1 安装飞书插件

```bash
cd ~/.openclaw/extensions
git clone https://github.com/openclaw/provider-feishu.git feishu
```

### 3.2 解决依赖问题

安装缺失的依赖：

```bash
cd ~/.openclaw/extensions/feishu
npm install @sinclair/typebox
```

### 3.3 配置飞书应用

1. 前往 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 获取 `App ID` 和 `App Secret`
4. 配置事件订阅和权限

编辑 `~/.openclaw/openclaw.json` 添加飞书配置：

```json
{
  "channels": {
    "feishu": {
      "appId": "your-app-id",
      "appSecret": "your-app-secret",
      "encryptKey": "your-encrypt-key",
      "verificationToken": "your-verification-token"
    }
  }
}
```

### 3.4 启动飞书 Channel

```bash
openclaw gateway start
```

飞书 Channel 会在后台运行，等待接收消息。

---

## 第四阶段：验证飞书连接

### 4.1 手机端测试

1. 打开手机飞书 App
2. 搜索并添加你的飞书机器人
3. 发送测试消息："你好"
4. 检查是否收到 AI 回复

### 4.2 查看日志

```bash
tail -f ~/.openclaw/logs/gateway.log
```

查看飞书消息的接收和处理情况。

---

## 总结

通过上述配置，我们成功实现了：

1. ✅ OpenClaw 接入火山引擎 Coding Plan
2. ✅ 命令行可正常调用 AI 模型
3. ✅ 飞书 Channel 配置完成
4. ✅ 手机端可通过飞书与 AI 对话

现在你可以随时随地通过手机飞书与 AI 助手交流了！

---

## 附录：常见问题

**Q: 飞书收不到消息？**
A: 检查事件订阅配置是否正确，确保回调 URL 可访问。

**Q: AI 回复很慢？**
A: 火山引擎 Coding Plan 响应速度取决于模型负载，可尝试更换其他模型。

**Q: 如何添加更多功能？**
A: 参考 OpenClaw 官方文档，可配置 Skills 和 Tools 扩展功能。