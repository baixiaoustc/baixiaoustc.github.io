---
layout: post
title: "Claude Code Skill 加载机制深度解析：一次真实踩坑记录"
date: 2026-04-12 23:30:00 +0800
categories: [claude-code, skill, 踩坑记录]
tags: [claude-code, skill, troubleshooting, loading-mechanism]
---

## 前言

今天在处理一个实际需求时，意外踩到了 Claude Code Skill 加载机制的坑。本文记录完整的排查过程、核心发现和解决方案，希望能帮助到遇到类似问题的开发者。

**背景**：用户想要在 Claude Code 中使用 `powerpoint-pptx` skill 来处理 PPT 文件。

---

## 一、问题现象

### 1.1 初始状态

- 下载了 `powerpoint-pptx-1.0.1` skill（OpenClaw/Claw 格式）
- 移动到 `~/.claude/skills/powerpoint-pptx-1.0.1/`
- **Claude Code 无法识别**：`Error: Unknown skill: powerpoint-pptx`

### 1.2 排查过程

通过查看 Claude Code 的 debug 日志，发现关键信息：

```
Loaded 0 unique skills (0 unconditional, 0 conditional, managed: 0, user: 0, project: 0)
```

这说明 Claude Code 确实尝试从 `~/.claude/skills/` 加载 skills，但**一个都没加载成功**。

---

## 二、核心发现

### 2.1 关键机制：目录名必须与 slug 完全匹配

经过多次尝试，终于找到了问题根源：

```
~/.claude/skills/{skill-slug}/
├── SKILL.md          # 必须
└── _meta.json        # 可选（Claw 格式）
```

**Claude Code 使用目录名作为 skill 标识符**，而不是读取 `_meta.json` 中的 `slug` 字段。

| 目录名 | _meta.json 中的 slug | 结果 | 原因 |
|--------|---------------------|------|------|
| `powerpoint-pptx-1.0.1` | `powerpoint-pptx` | ❌ 失败 | 目录名 ≠ slug |
| `powerpoint-pptx` | `powerpoint-pptx` | ✅ 成功 | 完全匹配 |

### 2.2 完整的加载机制

```
用户输入: /powerpoint-pptx
         ↓
Claude Code 查找: ~/.claude/skills/powerpoint-pptx/SKILL.md
         ↓
找到 → 加载 skill
未找到 → Error: Unknown skill
```

**重要**：Claude Code 不会解析 `_meta.json` 来获取 slug，它直接使用目录名作为标识符。

---

## 三、Claude Code vs OpenClaw Skill 对比

| 维度 | Claude Code Skills | OpenClaw/Claw Skills |
|------|-------------------|---------------------|
| **所属平台** | Anthropic Claude Code CLI | OpenClaw (openclaw.ai) |
| **格式** | SKILL.md + 可选 _meta.json | SKILL.md + _meta.json |
| **加载位置** | `~/.claude/skills/` 或 `.claude/skills/` | `~/.openclaw/skills/` |
| **目录名要求** | 必须与 slug 完全匹配 | 可以与 slug 不同 |
| **slug 来源** | 目录名 | `_meta.json` 中的 slug 字段 |
| **热重载** | ✅ 支持（changelog 确认） | ✅ 支持 |
| **版本号** | ❌ 不支持（目录名不能带版本） | ✅ 支持（如 `skill-1.0.1`） |

---

## 四、解决方案

### 4.1 使用 OpenClaw Skill 的正确步骤

如果你有一个 OpenClaw 格式的 skill（如 `powerpoint-pptx-1.0.1`），要在 Claude Code 中使用：

```bash
# 1. 确保目录名与 _meta.json 中的 slug 一致
mv ~/.claude/skills/powerpoint-pptx-1.0.1 \
   ~/.claude/skills/powerpoint-pptx

# 2. 检查 _meta.json 中的 slug
cat ~/.claude/skills/powerpoint-pptx/_meta.json
# 输出: { "slug": "powerpoint-pptx", ... }

# 3. 重启 Claude Code（确保缓存刷新）

# 4. 测试加载
/powerpoint-pptx
```

### 4.2 目录结构对比

**❌ 错误结构（Claw 默认）**：
```
~/.claude/skills/
└── powerpoint-pptx-1.0.1/      ← 带版本号
    ├── _meta.json              # slug: powerpoint-pptx
    └── SKILL.md
```

**✅ 正确结构（Claude Code 要求）**：
```
~/.claude/skills/
└── powerpoint-pptx/            ← 与 slug 一致
    ├── _meta.json              # slug: powerpoint-pptx
    └── SKILL.md
```

---

## 五、实践验证

### 5.1 Skill 成功加载后的输出

```
⏺ Skill(powerpoint-pptx)
  ⎿  Successfully loaded skill

⏺ 完美！Skill 加载成功了！🎉

  现在让我按照 skill 的指导来分析你的 PPT 文件...
```

### 5.2 使用 Skill 分析 PPT

Skill 加载成功后，按照其指导流程：

1. **盘点（Inventory）**：分析 Deck 结构
2. **文本提取**：提取幻灯片文本内容
3. **视觉检查**：检查布局、图表等

由于 `python-pptx` 库安装受限，使用 `unzip` 直接提取 PPTX 内容进行解析：

```bash
# PPTX 本质上是 ZIP 压缩包
cd /tmp && rm -rf pptx_extract && mkdir pptx_extract
unzip -q ~/Downloads/xxx.pptx -d pptx_extract

# 提取文本内容
cat pptx_extract/ppt/slides/slide1.xml | grep -o '<a:t>[^<]*</a:t>'
```

---

## 六、最佳实践建议

### 6.1 迁移 OpenClaw Skill 到 Claude Code

| 检查项 | 操作 | 说明 |
|--------|------|------|
| 目录名 | 移除版本号 | `skill-1.0.1` → `skill` |
| slug 一致性 | 核对 `_meta.json` | 确保目录名 = slug |
| 位置 | 放到正确目录 | `~/.claude/skills/` |
| 重启 | 完全退出再进入 | 清除缓存 |

### 6.2 调试技巧

如果 skill 无法加载：

1. **检查目录名**：`ls ~/.claude/skills/`
2. **验证 slug**：`cat ~/.claude/skills/{dir}/_meta.json | grep slug`
3. **查看日志**：Claude Code 启动时会输出加载的 skills 数量
4. **重启生效**：修改后建议完全重启 Claude Code

---

## 七、总结

### 核心要点

1. **目录名即标识符**：Claude Code 使用目录名作为 skill 标识，而非 `_meta.json` 中的 slug
2. **版本号要去掉**：目录名必须与 slug 完全一致，不能带版本后缀
3. **格式兼容**：OpenClaw 的 skill 格式（SKILL.md + _meta.json）可以直接用于 Claude Code
4. **热重载支持**：skill 修改后无需重启即可生效（但首次加载建议重启）

### 延伸思考

这次踩坑揭示了**跨平台工具链的兼容性问题**：
- 虽然 OpenClaw 和 Claude Code 的 skill 格式表面相似
- 但加载机制存在细微差异（slug 来源）
- 这种差异足以导致"看似正确，实则失败"的问题

**启示**：在使用跨平台工具时，不要仅凭直觉或格式相似性做假设，务必通过实际测试验证每个环节的工作机制。

---

## 参考信息

- **Claude Code 版本**：v2.1.104
- **Skill 名称**：powerpoint-pptx-1.0.1 → powerpoint-pptx
- **加载路径**：`~/.claude/skills/`
- **测试文件**：`基于MCPs_Skills_SPECs的AI风险智能体系演进路径-0417_final.pptx`

---

*记录时间：2026-04-12*
*更新时间：2026-04-14（补充完整内容）*
