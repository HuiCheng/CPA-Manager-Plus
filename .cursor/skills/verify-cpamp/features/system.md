# 系统信息

系统信息展示 Quick Links、demo 下通常可见的 SQLite Storage、可用模型列表，以及 Clear login data 控件；产品身份主要在 shell 品牌区。

## Sub-features

- `system-open` 打开 System Info。
- `system-about` 通过 shell 品牌/导航确认 CPA Manager Plus 身份（页内无独立 About 卡片）。
- `system-database` 显示 `SQLite Storage`（demo 默认可用）。
- `system-clear-login` 暴露清除登录控件；只读证明不必真正点击。

## How to get to it (user POV)

- 在侧栏选择 `System Info`。
- 打开 `#/demo/system`。
- 打开 `#/demo/system?maintenance=degraded` 以练习 degraded maintenance fixture。

## Driving it with control-cpamp

Preconditions:

- Demo 面板健康。
- `doctor` 为绿。

- **导航入口。** 选择 `System Info`。执行 `control-cpamp click --role link --name 'System Info'`。页面显示 `System Info`。
- **Hash 入口。** 打开 `#/demo/system`。执行 `control-cpamp goto --hash '#/demo/system'`。`Quick Links`、模型区与 `Clear login data` 可见。
- **Degraded fixture。** 打开 `#/demo/system?maintenance=degraded`。执行 `control-cpamp goto --hash '#/demo/system?maintenance=degraded'`。fixture 激活时出现维护相关文案。
- **证明。** 捕获 System Info。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/system.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/system.png`。

## Gotchas

- demo 下 `managerServiceAvailable` 为 true，通常应看到 `SQLite Storage`；不要把“缺存储卡片”当成 demo 默认终态。
- 清除登录会改本地认证状态。除非刻意测退出恢复，否则优先只读证明。
