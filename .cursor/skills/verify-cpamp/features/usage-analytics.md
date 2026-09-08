# 用量分析

用量分析展示已连接用量数据集的调用、token、成本与趋势拆分。

## Sub-features

- `usage-open` 从导航或 hash 打开分析页。
- `usage-overview` 显示分析标题与主要概览区域。
- `usage-empty-or-data` 区分 fixture/live 数据与空态、错误态。

## How to get to it (user POV)

- 在侧栏选择 `Usage Analytics`。
- 打开 `#/demo/usage-analytics`。
- 跟随文档链接进入 Usage Analytics demo。

## Driving it with control-cpamp

Preconditions:

- Demo 面板健康。
- `doctor` 为绿。

- **导航入口。** 选择 `Usage Analytics`。执行 `control-cpamp click --role link --name 'Usage Analytics'`。页面标题区域包含 `Usage Analytics`。
- **Hash 入口。** 打开深链。执行 `control-cpamp goto --hash '#/demo/usage-analytics'`。同一页面仍可见。
- **内容。** 等待分析内容或空态。执行 `control-cpamp wait --text 'Usage Analytics'`。出现概览组件或 `No usage data`。永不结束的 spinner 不算成功。
- **证明。** 捕获页面。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/usage-analytics.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/usage-analytics.png`。

## Gotchas

- 在非 demo 模式下，本路由受 request monitoring 可用性门控。不可用的 live 面板会重定向到 Config Panel。
- 图表可能稍晚才绘制。等待标题文案或空/错误文案，不要只靠固定 sleep。
