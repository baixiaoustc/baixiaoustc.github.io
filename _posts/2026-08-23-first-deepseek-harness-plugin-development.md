---
layout: post
title: "记第一次 DeepSeek Harness 插件开发"
date: 2026-08-23 00:00:00 +0800
categories: deepseek harness plugin
tags: DeepSeek Harness Cordis 插件开发 火山引擎 Ark kid-coder 一切皆插件
---
# 记第一次 DeepSeek Harness 插件开发

**日期**：2026-08-23
**关键词**：DeepSeek Harness、Agent 插件开发、Cordis、火山引擎 Ark、kid-coder、一切皆插件

## 核心结论（30 秒速览）

- DeepSeek Harness（dsh）是 DeepSeek 开源的 Agent 编排层，口号 **"Everything is a Plugin"**：模型、工具、技能、沙箱、存储、Agent 循环全部可替换。
- 第一次给 Harness 写插件（kid-coder 编程助教），从"只离线校验"到"真机跑通"共踩 4 个关键的坑，本文全部给出解法。
- 拿到的体感印证一个判断：**DSH 押注的不是把 Agent 做到当前范式最优，而是把 Harness 本身做成可热重载、可被 Agent 修改的"可塑性底座"**——为下一代自进化 Agent 打地基。

---

## 一、从一篇调研说起：Harness 是什么

在写第一个插件之前，先被 DeepSeek Harness 的定位吸引。

它不是模型，而是**运行 Agent 的编排层**。如果把 DeepSeek-V4 比作"发动机"，Harness 就是"整车底盘 + 总线"：V4 负责长上下文推理与代码生成，Harness 负责把模型接进工具、沙箱、会话管理与多 Agent 调度。

这套架构基于 **Cordis** 插件框架，把所有能力插件化——模型（models）、工具（tools）、技能（skills）、会话（sessions）、沙箱（sandboxes）、存储（storage）、循环（loops）、调度（scheduling）、UI 全部在内。换来一个直接收益：**换底层模型、换工具链、换执行环境，都不需要重写 Agent 逻辑**，改插件即可。

许可证 **MIT**，源码开源在 GitHub `deepseek-ai/deepseek-harness`。

这一层布局与 Anthropic 的 Claude Code、OpenAI 的 Codex CLI 思路一致，但 DeepSeek 把 Harness 整个开源，试图在生态层复制 V4 在模型层的影响力。**看完调研就一直想亲手拆一拆**，于是有了这次的插件开发。

---

## 二、要开发的插件：kid-coder（给娃的编程助教）

背景很简单：想给家里 5-18 岁的小朋友做编程入门辅导，配合低龄走 GESP、学 Python/海龟画图打基础的规划。kid-coder 就是这个"编程助教老师"。

它装载后，Harness 会自动多出 4 个工具，模型看到即可调用：

| 工具 | 作用 |
|---|---|
| `kid_explain` | 用生活比喻 + 极简示例解释一个概念或一小段代码 |
| `kid_practice` | 出一套带故事情境（动物 / 太空 / 海底…）的编程练习题，含脚手架提示 |
| `kid_review` | 温和地检查小朋友交上来的代码：先夸、一次只给一个改进点、给 ⭐ |
| `kid_steps` | 把大目标拆成 3-5 个能立刻得到反馈的小步骤 |

设计上有个刻意的克制：**工具只产出"教学脚手架 + 语气约束"，真正的讲解由 Harness 里的模型完成**。因此插件零外部依赖、零文件读写、无网络出站，开箱即用，非常安全——可以放心给小朋友的助教用。

**按 Harness 的能力分类，kid-coder 属于「工具（tools）」型插件**——它不做模型、会话、存储、沙箱、Agent 循环的替换，而是向模型多注册 4 个可调用工具，属接入层的能力扩展。

难点主要不在插件逻辑本身，而在**怎么把它真正装进 Harness 并跑起来**。第一天只靠"契约桩 + tsc 类型自校验"离线验证，第一天结束还没有真正运行过一次。第二天，用户反馈"跑不起来"，要求先把 Harness 装到机器上。

---

## 三、安装 DeepSeek Harness（源码方式)

第一步就撞上国内开发者的经典问题：**GitHub 访问不稳**。前一天的 clone 是 `blob:none` 的部分克隆，只有 `.git`，blob 没拉下来，工作区全空。

解法：浅克隆补齐。`git fetch --depth=1 origin master` 成功后 `git reset --hard FETCH_HEAD`，拉全 **7807 个文件**（commit `141eb6f` = release/dsh-0.1.0-rc.8）。

```sh
git fetch --depth=1 origin master
git reset --hard FETCH_HEAD
```

环境上，Node v22.22.0 满足 engines（`^22.19.0`），用 corepack 装 pnpm 11.7.0。随后：

- `pnpm install`：3m32s（`examples/` 与 `python/sdk-runtime` 的 bin WARN 属正常，需 build 后才有 `lib/bin.js`）。
- `pnpm run build`：约 25 分钟。最重的是 `tsc -b tsconfig.host.json`（约 13 分钟），随后 tsdown 打包 + vite web 构建，最终 `BUILD_EXIT=0`。
- 验证：`pnpm dsh --version` → `0.1.0-rc.8`。

Harness 本身装好了，接下来把插件接进去。

---

## 四、把 kid-coder 接进 workspace（第一个真正的坑）

独立安装插件时立刻报 404：`@deepseek-ai/cordis / schemastery / dsh-tools` 全是 **workspace 内部包，没有发到 npm**，外部插件根本没法 standalone `pnpm install`。

**结论：外部插件必须注册为 harness 的 workspace 成员**（和官方 `examples` 相同的"仅依赖解析"约定）：

- `pnpm-workspace.yaml` 追加 `- ../plugin-kid-coder`
- 根 `package.json` devDependencies 追加 `"@kidlab/dsh-kid-coder": "workspace:*"`
- 重跑 `pnpm install`，生成 `node_modules/@kidlab/dsh-kid-coder → 插件目录`，插件自己的 node_modules 里三个 `@deepseek-ai/*` 均链接到仓库本地构建。

接着修正两处：

1. **tsconfig 相对路径**：原按"放仓库内部"写（`../../tsconfig.base.json`、`../../../vendor/*`），改为兄弟目录位置（`../deepseek-harness/...`）。
2. **类型修正**：真实 schemastery 的 `Schema` 是**默认导出**（仓库惯例 `import Schema from '@deepseek-ai/schemastery'`），原来的命名导入 `{ Schema }` 报 TS2614。

构建时又踩了第三个坑：**不能用 `pnpm build`**——会触发插件目录自身的 install 校验，再次 404。解法是直接调链接好的 `tsc`，跳过那层校验：

```sh
./node_modules/.bin/tsc -p tsconfig.json
```

补上 `@types/node` symlink 后，产物 `lib/{config,index,tools}.js` + `lib/types/*.d.ts`，零类型错误。模块冒烟：`import('@kidlab/dsh-kid-coder')` 成功，exports 含 `Config,apply,inject,name`，`lib/tools.js` 含 4 个工具。

---

## 五、接入火山引擎 Ark 作为 LLM（不用改代码，改配置）

Harness 的一大卖点是模型可替换。这次接入火山引擎 Ark 作为默认 LLM provider——**全程不碰插件的代码，只改用户层配置**。

1. **验证端点协议**：curl 直连 `/api/coding/v3/chat/completions` → HTTP 200，OpenAI 兼容；`ark-code-latest` 实际路由到 `deepseek-v4-flash`，返回带 `reasoning_content`。
2. **确认默认 DSH_HOME = `~/.dsh`**。
3. **配置落盘**（都在用户层，不改仓库）：
   - `~/.dsh/cordis.patch.yml`：声明 `llm-pi-ai.providers.volcengine`（`api=openai-completions`、`baseURL=https://ark.cn-beijing.volces.com/api/coding/v3`、`model=ark-code-latest`），并把 kid-coder 用 `insert` 追加进去。
   - `~/.dsh/.env`：`VOLCENGINE_API_KEY=<KEY 已脱敏>`（**密钥不进配置文件，用 `apiKeyEnv` 引用**，Harness 自动加载 `$DSH_HOME/.env`）。
4. **校验**：`dsh --profile web --dump-config`，三重配置（llm-pi-ai / agent-default-model / kid-coder）全部齐全。

初次 `dsh web` 启动立刻抛第四个坑：`Cannot find package '@kidlab/dsh-kid-coder' imported from ~/.dsh/profiles/web/`。因为 **loader 是从 profile 目录解析插件，不是从仓库 node_modules**。

解法：在 `~/.dsh/profiles/web/node_modules/@kidlab/` 建 symlink 指向本地插件目录。由于插件自身的 node_modules 已链接 `@deepseek-ai/*`，随 symlink 的真实路径即可解析，无需在 profile 里重装。

最终 **`dsh web --no-open` 启动成功**，Web UI 在 `http://127.0.0.1:3080/` 返回 200（SPA 入口）。

---

## 六、真机端到端验证：插件真的被调用了

用 `headless` profile 的一次性任务做真机验证：

- 普通对话正常走火山模型。
- **真正调用 `kid_explain` 讲解 for 循环**时，输出高度个性化——按配置的 kidName=想想、age=8、favoriteTopic=海龟画图、gamified 生成内容（带名字、星星、海龟绘图 Python 示例、星级挑战），证明插件工具已注册、配置已生效。

这一步的意义在于：**从"代码类型自校验通过"到"模型在真实对话里能感知并调用我的工具"，中间隔着一整套编排链路**，而这次全部打通了。

---

## 七、四个坑速查表（可复用）

| 坑 | 现象 | 解法 |
|---|---|---|
| GitHub 国内不稳 | clone 残缺（只有 .git） | `git fetch --depth=1` 浅克隆 + `reset --hard FETCH_HEAD`，失败重试 |
| `@deepseek-ai/*` 是内部包 | standalone `pnpm install` 404 | 外部插件**必须作为 workspace 成员**接入，不能独立安装 |
| 真实 schemastery 默认导出 | `import { Schema }` 报 TS2614 | 改 `import Schema from '@deepseek-ai/schemastery'` |
| `pnpm run build` 二次校验 404 | 成员目录跑 pnpm 脚本触发 install 校验 | 直接调 `node_modules/.bin/tsc` 跳过 |
| loader 从 profile 目录解析插件 | `dsh web` 加载失败 | 在 `~/.dsh/profiles/web/node_modules/` 建 symlink 指向真实构建 |

几个额外经验：

- **patch 语法**（cordis-plugin-include `PatchOptions`）：`{id, config}` 整行替换 / `{insert: [...]}` 追加行；顶层是 YAML 数组。
- **Ark 无 pi-ai 原生路由**：用 `api: openai-completions` 手写即可。
- **机密不进配置**：密钥放 `.env`，配置里用 `apiKeyEnv` 引用。

---

## 八、写在最后：这次开发印证了什么

当初调研时读到的判断，在这次亲手开发里被一一印证：

**"一切皆可替换"不是口号，而是能感受到的机制。** 换 LLM provider、挂插件、调整体验，全程只改用户层配置，没动一行 Agent 核心代码。这才是 catering 给开发者而不是锁死开发者的基建。

**"Infra 化提高使用门槛"是真的。** `@deepseek-ai/*` 全是不发 npm 的 workspace 内部包、loader 从 profile 目录解析插件——这些门槛劝退的是浅尝辄止的人，但对真正要长期在上面做插件生态的开发者，换来的是清晰的边界和可组合的结构。

**DSH 押注的是 Harness 的可塑性。** 相比 Anthropic 在"当前范式下把 Agent 做到最优"，DeepSeek 直接以"替换/组合/撤销 Harness 组件"为首要假设。文中提到的 Creator Mode / 热重载 / 插件生命周期，正是 kid-coder 得以按 `{insert}` 补丁 + profile symlink 挂入的机制底座。

距离真正的自进化 Agent 还差两步：系统自身的稳定性（热重载 / 事务式 Harness Mutation），以及持续可靠的 Eval（有生成 ≠ 有改进）。这次完成的，是 **Harness-level RSI 的第一步**。

---

## 九、附录：海外独角兽《模型之外，Harness 正在成为影响 Agent 能力的另一个关键变量》要点归档

> 来源：Founder Park 转载「海外独角兽」公众号文章
> 链接：https://mp.weixin.qq.com/s/xNpFx6ycP-eGWQ_rYsa2aw
> 此篇与 DeepSeek Harness 主题直接相关，故将要点一并归档于此。

### 一句话概括

DeepSeek Harness（DSH）不把 Claude Code / Codex 当直接竞品，而是**开源 + Infra 化**押注下个范式：把 Harness 本身做成可被热重载、可被 Agent 自己拆解/替换/撤销的对象，为下一代「自进化 Agent（Harness-level RSI）」打底座。

### 7 条核心 Key Takeaways

1. **DSH = 可热重载 + 面向 Agent 自修改的 Harness**：延续 DeepSeek 一贯的「开源、infra 化」路线；Infra 化提高使用门槛，避免像 OpenClaw 那样复杂度膨胀过快、难维护。

2. **三层结构**：①可直接用的 Coding Agent（本地 Web UI 为快速入口，不需桌面端/TUI）；②everything-is-a-plugin 的 Harness 构造框架（连 agent loop 都可换成插件）；③Cordis 底层 meta-framework（热重载、自由组合、彻底遗忘和删除）。

3. **Cordis 插件 ≠ MCP/Skills**：相当于把 Claude Code 的 hooks、MCP、subagents、核心 loop 统一成一种插件机制；解决「动态组合」问题（依赖出现/消失时重组、卸载时撤销 context 副作用），像早期 Unix / OS 高上限。

4. **四个模式**：标准（80% 任务）、PTC/Code（批量工具调用密集）、极简（控制变量的实验室环境）、**Creator 模式（值得关注）**：交互式 Agent Foundry，允许 Agent 检查 runtime、实验插件、写新 Preset；虽非自进化，但能收集自进化所需的训练数据，也是插件生态创作入口。

5. **长期目标：To Developer → To Agent**：把 Harness 做成 Agent 可修改/热重载的对象，服务下一代自进化与持续学习框架——像一艘持续航行的「忒修斯之船」。

6. **两种 Harness 哲学对比**：Anthropic=在当前范式下做最优 Agent 产品（实证科学，从 SOTA 模型失败模式出发，删 80%+ System Prompt、Ablation 验证）；DeepSeek=押注下一范式，直接以「替换/组合/撤销 Harness component」为首要假设，研究的是 **Harness 的可塑性（meta-harness）**。A/O 研究 Harness 能力，DSH 研究 Harness 可塑性。

7. **距离真正 self-evolve 还差两步**：①系统自身稳定性（热重载/事务式 Harness Mutation，Cordis 已解决大半）；②持续可靠的 Eval（有生成≠有改进，需 Learning Loop 学习+提出修改、Eval 评估有效性）。当前是 **Harness-level RSI 的第一步**。

### 生态数据（截至 08-19）

- GitHub `dsh-plugin` Topic 约 7,700 个仓库；`awesome-dsh-plugin` 收录约 1,500 个，约 9,200 Stars / 1,350 Forks / 1,800+ commits。
- 插件最集中两类：①补产品体验（Web UI、桌面端、监控、交互）；②接外部 Agent 能力（长期记忆、Browser、Vision、Sandbox、Workflow）。
- 分发基建已现：`dsh-market`（搜索/安装/升级）、`dsh-find-plugin`（Agent 对话中主动找插件）。

### 对我们这次工作的印证

- 文中「Infra 化提高门槛、避免复杂度膨胀」与「一切皆可替换、以插件接入」恰是本次安装 DSH 的体感：`@deepseek-ai/*` 均为 workspace 内部包未发 npm，外部插件必须注册为 workspace 成员接入；loader 从 profile 目录解析插件需 symlink 挂载。
- 文中提到的 Creator Mode / 热重载 / Plugin 生命周期，正是 kid-coder 插件得以按 `{insert}` 补丁 + profile symlink 挂入的机制底座（Cordis `PatchOptions`）。

---

**参考来源**

- DeepSeek Harness 官方页面：https://www.deepseek.com/harness/en/
- GitHub 仓库：https://github.com/deepseek-ai/DeepSeek-Harness
- Cordis 插件框架：https://github.com/cordiverse/cordis
- 海外独角兽《模型之外，Harness 正在成为影响 Agent 能力的另一个关键变量》：https://mp.weixin.qq.com/s/xNpFx6ycP-eGWQ_rYsa2aw