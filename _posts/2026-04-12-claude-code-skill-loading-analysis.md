---
layout: post
title: "Claude Code Skill 加载机制深度解析：一次真实踩坑记录"
date: 2026-04-12 23:30:00 +0800
categories: [claude-code, skill, 踩坑记录]
tags: [claude-code, skill, troubleshooting, loading-mechanism]
---

## 前言

今天在处理一个实际需求时，意外踩到了 Claude Code Skill 加载机制的坑。本文记录完整的排查过程、核心发现和解决方案，希望能帮助到遇到类似问题的开发者。

**背景**：用户需要配置 `baidu-search` skill，用于定时搜索蚂蚁集团新闻。

---

## 一、问题现象

### 1.1 初始状态

- 下载了 `powerpoint-pptx-1.0.1` skill（Claw 格式）
- 移动到 `~/.claude/skills/powerpoint-pptx-1.0.1/`
- **Claude Code 无法识别**：`Error: Unknown skill: powerpoint-pptx`

### 1.2 尝试过程

| 步骤 | 操作 | 结果 |
|------|------|------|
| 1 | 重启 Claude Code | ❌ 无效 |
| 2 | 检查日志 `Loaded 0 unique skills` | 确认未加载 |
| 3 | **修改目录名**：`powerpoint-pptx-1.0.1` → `powerpoint-pptx` | ✅ 成功加载 |

---

## 二、核心发现

### 2.1 关键机制：目录名必须与 slug 匹配

```
~/.claude/skills/{skill-slug}/
├── SKILL.md          # 必须
└── _meta.json        # 可选（Claw 格式）
```

**Claude Code 使用目录名作为 skill 标识符**，而不是读取 `_meta.json` 中的 `slug` 字段。

| 目录名 | 结果 | 原因 |
|--------|------|------|
| `powerpoint-pptx-1.0.1` | ❌ 失败 | 包含版本号，与 `slug: 