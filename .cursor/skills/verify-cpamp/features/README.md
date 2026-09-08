# CPA Manager Plus 验证地图

这是 CPA Manager Plus 管理面板用户可见行为的维护源。先读本索引，再打开对应 feature 文件作为配方。

## Baseline preconditions

- 用 `./.cursor/skills/verify-cpamp/scripts/launch.sh` 启动 demo 面板。
- 默认 URL 为 `http://127.0.0.1:4173/#/demo`。
- 设置唯一的 `CPAMP_VERIFY_RUN_ID`，避免并发 run 共享 Chrome profile 或 state 文件。
- 断言时使用英文 UI 标签。Demo 默认跟随浏览器语言。若标签不一致，先用 header 的 `Language` 切到 `English`。
- 运行 `./.cursor/skills/verify-cpamp/scripts/doctor.sh`，要求 `"ok": true`。
- 不要驱动本轮未启动的实例。
- Live 登录、Manager Server setup，以及破坏性 CPA 变更需要一次性 backend。没有时把入口记为 `verified-unreachable` 并写明缺失前置条件。不要用 demo 路径冒充已验证。

## Driving conventions

- 除非配方另写前置条件，否则从 `#/demo` 起步。
- 优先 ARIA role 与 accessible name，不要靠 CSS 选择器或 DOM 位置。
- 深链本身就是一等用户入口时，优先用文档化的 hash 路由。
- 把命令当字面量。引号内的名称与 flag 不要改写。
- 浏览器动作走 `./.cursor/skills/verify-cpamp/scripts/control-cpamp`。
- 配方要求时，在变更后恢复 demo 安全状态。Cleanup 时不要删除 proof artifacts。

## Proof and skip reporting

- 同时捕获用户动作与结果态，不要只留最终画面。
- UI 证明包含 ARIA snapshot 与能看出面板身份的截图。
- 变更证明要有第二次面向用户的读回。
- 每份 artifact 记录 feature ID 与所用入口。
- 不可达路径要写尝试过的命令与未满足前置条件。
- 不要把跳过的入口写成已通过另一路径验证。

## Feature entry contract

每个 feature 文件以 H1 标题开头，再用一段说明用户可见行为。随后严格按此顺序使用四个英文 H2（结构约定，供 `/maintain-verification-skill` 识别）：

1. `Sub-features` 列出短 ID，每行一种行为。
2. `How to get to it (user POV)` 列出全部用户入口。
3. `Driving it with control-cpamp` 以 `Preconditions:` 开头，用带标签的条目把用户动作、精确命令与可观察结果配对。
4. `Gotchas` 列出会浪费或污染验证 run 的陷阱。

地图里只写用户路径、稳定句柄、所需状态、命令与可观察证明，不写实现细节。

## Features

- [仪表盘](./dashboard.md) 覆盖 `#/demo` 下的首页概览。
- [登录与初始化](./login-and-setup.md) 覆盖 `#/login`、Manager Server setup wizard，以及 CPA Panel 连接。
- [用量分析](./usage-analytics.md) 覆盖成本与用量分析。
- [请求监控](./monitoring-center.md) 覆盖监控数据页签与请求检查。
- [鉴权问题处理](./account-actions.md) 覆盖 `#/demo/monitoring/account-actions`。
- [模型定价](./model-prices.md) 覆盖 `#/demo/model-prices` 与 monitoring 重定向。
- [日志查看](./logs.md) 覆盖 CPA 日志查看控件。
- [插件](./plugins.md) 覆盖已安装插件、插件商店与插件资源页。
- [配置面板](./config.md) 覆盖 visual、source 与 Manager 配置页签。
- [AI 提供商](./ai-providers.md) 覆盖提供商列表与各提供商新建/编辑路由。
- [凭证管理](./accounts.md) 覆盖列表、健康检查、OAuth 配置与详情页签。
- [OAuth 登录](./oauth.md) 覆盖独立 OAuth 页面。
- [系统信息](./system.md) 覆盖系统状态、数据库状态与清除登录。
- [壳层控件](./shell-chrome.md) 覆盖 header 刷新、语言、主题、视觉效果、退出与移动端导航。
