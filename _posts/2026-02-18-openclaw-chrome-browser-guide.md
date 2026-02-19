---
layout: post
title: "OpenClaw Chrome 浏览器扩展安装与使用指南"
date: 2026-02-18 12:30:00 +0800
categories: openclaw tutorial browser
tags: openclaw chrome browser extension tutorial
---

## 引言

在使用 OpenClaw 的过程中，浏览器功能是一个非常重要的特性。本文记录了如何安装和配置 OpenClaw Chrome 浏览器扩展，以及如何解决常见问题。

## 问题背景

最初尝试使用浏览器功能时，遇到了以下问题：

- ❌ `web_fetch` 工具无法获取微信公众号文章内容（反爬虫机制）
- ❌ `browser` 工具报错 "Can't reach the OpenClaw browser control service"

## 问题诊断

经过排查，发现核心问题是：**OpenClaw Browser Relay（Chrome 扩展）未连接**

### 系统状态

- ✅ OpenClaw Gateway 正常运行（端口 18789）
- ✅ Chrome 扩展已安装
- ❌ **扩展未连接**（需要点击扩展图标连接）

## 解决方案

### 1. 📦 使用官方命令生成并安装扩展

1.  **安装扩展到本地路径**
    打开你的终端，直接运行以下命令。这个命令会自动将 OpenClaw Chrome 扩展的文件释放到你的电脑上一个特定的位置 。
    ```bash
    openclaw browser extension install
    ```

2.  **获取扩展所在的具体目录**
    安装完成后，你需要知道文件被放到了哪里。运行下面的命令，它会打印出完整的文件夹路径 。
    ```bash
    openclaw browser extension path
    ```
    **请复制这个命令输出的路径**，下一步会用到。

3. **安装步骤：**
打开 Chrome，访问 `chrome://extensions/`，开启右上角「开发者模式」，点击「加载已解压的扩展程序」，选择刚才的路径并安装。

### 2. 连接扩展

**关键步骤：**
1. 打开 Chrome，访问任意网页（如 https://www.baidu.com）
2. 点击 Chrome 工具栏上的 **OpenClaw 图标**（爪子🐾形状）
3. 确保显示为 **"已连接"** 或 **"ON"**（绿色状态）

### 3. 验证成功

连接成功后，再次尝试使用浏览器功能：

```bash
# 使用 browser 工具打开网页
browser open https://mp.weixin.qq.com/s/38eld8wd05fKJbwqbQzCzA
```

成功返回：
```json
{
  "targetId": "84E68279F2C68A085964257DA3D7246D",
  "title": "",
  "url": "https://mp.weixin.qq.com/s/38eld8wd05fKJbwqbQzCzA",
  "wsUrl": "ws://127.0.0.1:18792/cdp",
  "type": "page"
}
```

✅ **浏览器控制服务连接成功！**

## 关键要点总结

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 无法使用浏览器 | Browser Relay 未连接 | 安装 Chrome 扩展并点击连接 |
| 无法访问 Chrome 商店 | 网络限制 | 从 GitHub 手动下载安装 |
| 微信公众号内容获取失败 | 反爬虫机制 | 使用浏览器自动化访问 |

## 总结

通过本文的步骤，你可以：
1. 成功安装 OpenClaw Chrome 浏览器扩展
2. 连接浏览器控制服务
3. 使用浏览器功能打开网页、获取内容

**核心要点：** 浏览器功能的关键在于正确安装并连接 Browser Relay 扩展。

---

**发布时间：** 2026年2月18日  
**分类：** OpenClaw, 教程, 浏览器  
**标签：** openclaw, chrome, browser, extension, tutorial