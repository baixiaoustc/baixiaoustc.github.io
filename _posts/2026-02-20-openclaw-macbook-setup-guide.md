---
layout: post
title: "OpenClaw MacBook 配置指南：后台运行 + 合盖保持运行"
date: 2026-02-20 23:45:00 +0800
categories: openclaw tutorial macos
tags: openclaw macbook launchagent caffeinate setup guide
---

> 完整记录：OpenClaw 后台运行 + 合盖保持运行 的配置过程

---

## 📋 任务概述

| 任务 | 目标 | 状态 |
|------|------|------|
| 任务一 | 将 OpenClaw 配置为 LaunchAgent 后台服务 | ✅ 完成 |
| 任务二 | 解决合盖/息屏后 OpenClaw 停止运行问题 | ✅ 完成 |

---

## 任务一：配置 LaunchAgent 后台服务

### 问题背景

通过终端直接启动 OpenClaw 时，关闭终端后服务会停止，无法实现后台持续运行。

### 解决方案

使用 macOS 的 LaunchAgent 机制，将 OpenClaw 注册为系统服务。

### 配置步骤

#### 1. 安装 LaunchAgent 服务

```bash
openclaw gateway install
```

安装后，OpenClaw 会创建以下文件：

- **服务配置文件**: `~/Library/LaunchAgents/ai.openclaw.gateway.plist`
- **日志文件**: `/tmp/openclaw/openclaw-2026-02-20.log`
- **错误日志**: `~/.openclaw/logs/gateway.err.log`

#### 2. 验证服务状态

```bash
openclaw gateway status
```

正常运行的输出应包含：

```
Service: LaunchAgent (loaded)
Runtime: running (pid xxxxx)
RPC probe: ok
Listening: 127.0.0.1:18789
```

#### 3. 服务管理命令

```bash
# 启动服务
openclaw gateway start

# 停止服务
openclaw gateway stop

# 重启服务
openclaw gateway restart

# 查看实时日志
openclaw logs --follow
```

### 实现效果

- ✅ 开机自动启动
- ✅ 后台持续运行（不依赖终端）
- ✅ 崩溃自动重启（KeepAlive 机制）

---

## 任务二：解决合盖/息屏后服务停止问题

### 问题背景

即使配置了 LaunchAgent，当 MacBook 合盖或息屏后，系统会进入睡眠状态，导致 OpenClaw 停止运行。

### 根因分析

- macOS 默认行为：合盖或息屏后触发系统睡眠
- 睡眠状态下，所有用户进程（包括 LaunchAgent 启动的进程）会被挂起
- 需要使用 `caffeinate` 工具防止系统睡眠

### 解决方案

使用 macOS 内置的 `caffeinate` 命令包装 OpenClaw 启动，在连接电源时防止系统睡眠。

### 配置步骤

#### 1. 查看当前 LaunchAgent 配置

```bash
cat ~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

#### 2. 修改 `ProgramArguments`

编辑 `~/Library/LaunchAgents/ai.openclaw.gateway.plist`，将：

```xml
<key>ProgramArguments</key>
<array>
  <string>/usr/local/bin/node</string>
  <string>/usr/local/Cellar/node@22/22.22.0/lib/node_modules/openclaw/dist/index.js</string>
  <string>gateway</string>
  <string>--port</string>
  <string>18789</string>
</array>
```

修改为：

```xml
<key>ProgramArguments</key>
<array>
  <string>/usr/bin/caffeinate</string>
  <string>-s</string>
  <string>/usr/local/bin/node</string>
  <string>/usr/local/Cellar/node@22/22.22.0/lib/node_modules/openclaw/dist/index.js</string>
  <string>gateway</string>
  <string>--port</string>
  <string>18789</string>
</array>
```

**参数说明：**

| 参数 | 含义 |
|------|------|
| `/usr/bin/caffeinate` | macOS 内置防睡眠工具 |
| `-s` | 只在连接电源时防止睡眠（-s = on AC power） |

#### 3. 重新加载服务

```bash
# 卸载旧配置
launchctl unload ~/Library/LaunchAgents/ai.openclaw.gateway.plist

# 等待 1 秒
sleep 1

# 加载新配置
launchctl load ~/Library/LaunchAgents/ai.openclaw.gateway.plist
```

#### 4. 验证配置

```bash
openclaw gateway status
```

确认输出中的 `Command` 字段已包含 `caffeinate`：

```
Command: /usr/bin/caffeinate -s /usr/local/bin/node ...
```

### 实现效果

- ✅ 连接电源时，合盖/息屏后 OpenClaw 继续运行
- ✅ 使用电池时，系统正常睡眠（保护电池寿命）
- ✅ 自动识别电源状态，智能切换

---

## 完整配置示例

最终生成的 `~/Library/LaunchAgents/ai.openclaw.gateway.plist` 内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>ai.openclaw.gateway</string>
    
    <key>Comment</key>
    <string>OpenClaw Gateway (v2026.2.13)</string>
    
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    
    <key>ProgramArguments</key>
    <array>
      <string>/usr/bin/caffeinate</string>
      <string>-s</string>
      <string>/usr/local/bin/node</string>
      <string>/usr/local/Cellar/node@22/22.22.0/lib/node_modules/openclaw/dist/index.js</string>
      <string>gateway</string>
      <string>--port</string>
      <string>18789</string>
    </array>
    
    <key>StandardOutPath</key>
    <string>/Users/baixiao/.openclaw/logs/gateway.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/baixiao/.openclaw/logs/gateway.err.log</string>
    
    <key>EnvironmentVariables</key>
    <dict>
      <key>HOME</key>
      <string>/Users/baixiao</string>
      <key>PATH</key>
      <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
      <key>OPENCLAW_GATEWAY_PORT</key>
      <string>18789</string>
      <key>OPENCLAW_GATEWAY_TOKEN</key>
      <string>840f528bae2cc316f454e2b96e023d3faf492fa5e83f742f</string>
      <key>OPENCLAW_LAUNCHD_LABEL</key>
      <string>ai.openclaw.gateway</string>
      <key>OPENCLAW_SYSTEMD_UNIT</key>
      <string>openclaw-gateway.service</string>
      <key>OPENCLAW_SERVICE_MARKER</key>
      <string>openclaw</string>
      <key>OPENCLAW_SERVICE_KIND</key>
      <string>gateway</string>
      <key>OPENCLAW_SERVICE_VERSION</key>
      <string>2026.2.13</string>
      <key>NODE_EXTRA_CA_CERTS</key>
      <string>/etc/ssl/cert.pem</string>
    </dict>
  </dict>
</plist>
```

---

## 常见问题排查

### Q1: 修改 plist 后服务无法启动

**排查步骤：**

```bash
# 检查 plist 语法是否正确
plutil -lint ~/Library/LaunchAgents/ai.openclaw.gateway.plist

# 查看错误日志
tail -50 ~/.openclaw/logs/gateway.err.log
```

### Q2: 合盖后仍然无法收到消息

**检查要点：**

1. 确认是否连接电源（`caffeinate -s` 只在连接电源时有效）
2. 检查服务状态：`openclaw gateway status`
3. 查看是否有错误日志：`tail -100 /tmp/openclaw/openclaw-2026-02-20.log`

### Q3: 电池模式下也需要保持运行

如果希望即使使用电池时也不睡眠，将 `-s` 参数移除：

```xml
<string>/usr/bin/caffeinate</string>
<!-- 移除 -s 参数，或者改为 -i（防止空闲睡眠） -->
<string>/usr/local/bin/node</string>
```

⚠️ **注意**：这会导致电池快速耗尽，建议仅在必要时使用。

---

## 参考资料

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [Apple LaunchAgent 文档](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html)
- [caffeinate 手册](https://ss64.com/osx/caffeinate.html)

---

**文档版本**: 1.0  
**最后更新**: 2026-02-20  
**适用系统**: macOS (MacBook)  
**OpenClaw 版本**: 2026.2.13