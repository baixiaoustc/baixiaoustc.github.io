---
layout: post
title: "OpenClaw 飞书插件升级故障复盘：从 Outbound 配置失效到兼容性困境"
date: 2026-05-05 00:00:00 +0800
categories: openclaw troubleshooting
tags: openclaw feishu plugin outbound compatibility
---

OpenClaw 从 2026.3.7 升级到 2026.5.2 后，定时任务本体执行正常，但飞书汇报消息发送失败。本文记录完整的故障现象、根因分析和解决过程。

---

## 故障现象

### 时间线

| 时间 | 事件 | 状态 |
|------|------|------|
| 2026-05-03 | OpenClaw 升级至 2026.5.2 | ✅ 完成 |
| 2026-05-04 01:00 | 每日记忆归档任务执行 | ⚠️ 执行成功，汇报发送失败 |
| 2026-05-04 02:00 | 每日版本检查任务执行 | ⚠️ 执行成功，汇报发送失败 |
| 2026-05-04 日间 | 人工排查（重启、改配置） | ❌ 未解决 |
| 2026-05-05 | 迁移至官方插件 | ✅ 解决 |

### 关键发现

**错误日志**：
```
Outbound not configured for channel: feishu
```

**现象特征**：
- 定时任务本体执行成功（归档、版本检查完成）
- 仅发送汇报消息到飞书这一步失败
- Inbound（收消息）完全正常
- Outbound（发消息）在 cron 任务的 isolated session 中失败

---

## 根因分析

### 第一层：代码层面

通过排查 OpenClaw 2026.5.2 源码，问题出在 `deliver-BCtMABIO.js`：

```javascript
// 1. 尝试从 registry 加载 feishu outbound 适配器
outbound = await loadChannelOutboundAdapter("feishu");

// 2. 失败则调用 bootstrapOutboundChannelPlugin —— 但此函数在 2026.5.2 中是空实现！
bootstrapOutboundChannelPlugin({ channel: "feishu", cfg: params.cfg });

// 3. 再次尝试加载 —— 仍然失败
outbound = await loadChannelOutboundAdapter("feishu");

// 4. 抛出错误
if (!handler) throw new Error(`Outbound not configured for channel: ${params.channel}`);
```

### 第二层：架构差异

| 方向 | 处理机制 | 状态 |
|------|----------|------|
| Inbound | Gateway 主进程直接处理，使用启动时已加载的插件 | 正常 |
| Outbound | cron 任务的 isolated session 通过 registry 查找适配器 | 失败 |

### 第三层：兼容性断裂

当前使用的 `extensions/feishu` v0.1.16 在本次升级后出现以下问题：

| 问题 | 详情 | 影响 |
|------|------|------|
| 使用已弃用的 SDK | `openclaw/plugin-sdk/compat` | 可能导致加载异常 |
| 缺少 channelConfigs | `openclaw.plugin.json` 无 `channelConfigs` metadata | registry 无法识别 outbound 通道 |
| 缺少 tools 声明 | `contracts.tools` 未声明 | 工具注册失败 |
| 空的 configSchema | `configSchema.properties` 为空 | 配置验证受限 |

---

## 解决方案：迁移至官方插件

### 解决步骤

**Step 1：安装官方插件**

```bash
npx -y @larksuite/openclaw-lark install
```

**Step 2：清理旧配置**

修改 `~/.openclaw/openclaw.json`：

```json
{
  "channels": {
    "feishu": {
      "enabled": true,
      "appId": "cli_***",
      "appSecret": {
        "source": "file",
        "provider": "lark-secrets",
        "id": "/lark/appSecret"
      }
    }
  },
  "plugins": {
    "entries": {
      "openclaw-lark": { "enabled": true }
    },
    "allow": ["browser", "openclaw-lark", "volcengine"]
  }
}
```

**Step 3：删除社区版残留**

```bash
rm -rf ~/.openclaw/npm/node_modules/@m1heng-clawd/feishu
```

**Step 4：重启 Gateway**

```bash
openclaw gateway restart
```

**Step 5：验证修复**

```bash
openclaw feishu-diagnose
```

---

## 经验教训

1. **版本兼容性验证**：大版本升级后，插件兼容性需验证，特别是 outbound/定时任务等异步场景
2. **升级测试的盲区**：异步任务、外部集成通道必须在升级后验证
3. **配置迁移**：需清理旧的插件配置避免冲突

---

## 给其他用户的建议

如果遇到类似问题，建议尝试迁移至官方插件 `@larksuite/openclaw-lark`：

```bash
npx -y @larksuite/openclaw-lark install
```

官方插件与 OpenClaw 版本兼容性更好，功能更完整（12+ 工具），迁移成本低。
