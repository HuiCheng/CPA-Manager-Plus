# 日志查看

在启用写入文件日志时，日志查看器展示 CPA 文件日志，并提供刷新、清空、下载与错误日志辅助控件。

## Sub-features

- `logs-open` 从导航或 hash 打开 Logs Viewer。
- `logs-refresh` 刷新日志面板。
- `logs-empty-or-content` 显示日志文本或空态。

## How to get to it (user POV)

- 在侧栏选择 `Logs Viewer`。
- 打开 `#/demo/logs`。

## Driving it with control-cpamp

Preconditions:

- Demo 面板健康。
- `doctor` 为绿。

- **导航入口。** 选择 `Logs Viewer`。执行 `control-cpamp click --role link --name 'Logs Viewer'`。页面显示 `Logs Viewer`。
- **Hash 入口。** 打开 `#/demo/logs`。执行 `control-cpamp goto --hash '#/demo/logs'`。同一页面仍可见。
- **刷新控件。** 若存在 `Refresh Logs`，选择它。执行 `control-cpamp click --role button --name 'Refresh Logs'`。查看器仍挂载。
- **证明。** 捕获内容或空态。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/logs.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/logs.png`。

## Gotchas

- 禁用文件日志时会出现空态文案。这是有效终态。
- `Clear Logs` 在 live CPA 上有破坏性。除非实例可丢弃，否则跳过。
