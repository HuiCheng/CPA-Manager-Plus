# 仪表盘

仪表盘是 demo 首页概览。在 `#/demo` 加载后展示流量、collector 与健康摘要卡片。

## Sub-features

- `dashboard-open` 通过导航或 demo 根 hash 打开首页概览。
- `dashboard-refresh` 用 header 刷新仪表盘数据且不离开页面。
- `dashboard-identity` 在 shell 中展示 CPA Manager Plus 品牌。

## How to get to it (user POV)

- 打开 `http://127.0.0.1:4173/#/demo`。
- 打开 `http://127.0.0.1:4173/#/demo/dashboard`。
- 在侧栏选择 `Dashboard`。

## Driving it with control-cpamp

Preconditions:

- Demo 面板在 `http://127.0.0.1:4173/#/demo` 健康。
- `control-cpamp doctor` 报告 `"ok": true`。

- **根入口。** 打开 demo 根路径。执行 `control-cpamp goto --hash '#/demo'`。页面出现 `Dashboard` 与欢迎文案。
- **导航入口。** 选择 `Dashboard`。执行 `control-cpamp click --role link --name 'Dashboard'`。shell 仍停在仪表盘概览。
- **别名入口。** 打开 dashboard 别名。执行 `control-cpamp goto --hash '#/demo/dashboard'`。同一概览仍可见。
- **刷新。** 选择 `Refresh All`。执行 `control-cpamp click --role button --name 'Refresh All'`。页面仍在 Dashboard，并继续显示概览内容。
- **证明。** 捕获概览。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/dashboard.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/dashboard.png`。两份产物都显示 Dashboard 内容与面板身份。

## Gotchas

- 从全新浏览器文档 URL 打开时，hash 路由必须带 `#/demo`，不能只写 `/demo`。
- 侧栏折叠时可能隐藏导航文案。若 AX 树里没有 `Dashboard`，展开侧栏或改用 hash 导航。
- Demo 的 collector 与健康卡片是 fixture。不要在此断言 live CPA 队列连通。
