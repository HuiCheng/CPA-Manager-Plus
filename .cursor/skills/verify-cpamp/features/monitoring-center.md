# 请求监控

请求监控是持久化请求历史工作区。用户检查 account、client key、realtime 视图，再下钻失败与筛选。

## Sub-features

- `monitoring-open` 从导航或 hash 打开 Request Monitor。
- `monitoring-tab-accounts` 显示 Accounts 数据页签。
- `monitoring-tab-api-keys` 显示 Client Keys 数据页签。
- `monitoring-tab-realtime` 显示 Realtime 数据页签。
- `monitoring-refresh` 从 header 刷新监控数据。

## How to get to it (user POV)

- 在侧栏选择 `Request Monitor`。
- 打开 `#/demo/monitoring`。
- 跟随文档链接进入 Monitoring demo。

## Driving it with control-cpamp

Preconditions:

- Demo 面板健康。
- `doctor` 为绿。

- **导航入口。** 选择 `Request Monitor`。执行 `control-cpamp click --role link --name 'Request Monitor'`。页面显示如 `Total Calls` 这类账户概览指标。
- **Hash 入口。** 打开 `#/demo/monitoring`。执行 `control-cpamp goto --hash '#/demo/monitoring'`。证明用户入口时优先用导航点击。路由稳定后可见 `Accounts`、`Client Keys`、`Realtime`。
- **Accounts 页签。** 选择 `Accounts`。执行 `control-cpamp click --role tab --name 'Accounts'`。账户概览内容仍可见。
- **Client Keys 页签。** 选择 `Client Keys`。执行 `control-cpamp click --role tab --name 'Client Keys'`。Client key 分析内容出现。
- **Realtime 页签。** 选择 `Realtime`。执行 `control-cpamp click --role tab --name 'Realtime'`。Realtime 请求内容出现。
- **刷新。** 选择 `Refresh All`。执行 `control-cpamp click --role button --name 'Refresh All'`。当前监控页签仍挂载。
- **证明。** 捕获 Realtime 或 Accounts。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/monitoring.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/monitoring.png`。

## Gotchas

- Live 面板在没有 request monitoring 时会重定向到 Config Panel。Demo 模式保持路由可用。
- 页签 accessible name 可能带徽章，例如 `Realtime 367`。用不精确名称匹配 `Realtime`、`Accounts` 或 `Client Keys`。
- 只改 hash 可能只更新面包屑而不 remount demo 路由。`control-cpamp goto` 优先点击匹配的 `a[href]`，必须直接设 hash 时会 reload。
- 可见文案使用如 `Total Calls` 的监控指标。不要只等待字符串 `Request Monitoring`。
- 窄屏时页签文案会缩短。优先使用上面的完整英文名。
- 查询参数 `?maintenance=degraded` 会改变 demo fixture 健康态。使用时要记录该 query。
