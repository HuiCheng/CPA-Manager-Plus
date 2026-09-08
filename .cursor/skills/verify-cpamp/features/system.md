# 系统信息

系统信息展示产品身份、连接状态、可选 SQLite 存储状态、模型清单入口，以及清除登录辅助。

## Sub-features

- `system-open` 打开 System Info。
- `system-about` 显示 CPA Manager Plus 身份。
- `system-database` 在 Manager Server 功能可用时显示 SQLite 存储状态。
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
- **Hash 入口。** 打开 `#/demo/system`。执行 `control-cpamp goto --hash '#/demo/system'`。About 与状态区域可见。
- **Degraded fixture。** 打开 `#/demo/system?maintenance=degraded`。执行 `control-cpamp goto --hash '#/demo/system?maintenance=degraded'`。fixture 激活时出现维护相关文案。
- **证明。** 捕获 System Info。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/system.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/system.png`。

## Gotchas

- 数据库状态依赖 Manager Server 可用性。缺少存储卡片在 demo 里仍可能是有效终态。
- 清除登录会改本地认证状态。除非刻意测退出恢复，否则优先只读证明。
