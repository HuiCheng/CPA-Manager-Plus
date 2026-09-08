# 鉴权问题处理

鉴权问题处理列出进入账户动作队列、待审阅与恢复的凭证失败。

## Sub-features

- `account-actions-open` 打开鉴权问题工作区。
- `account-actions-empty-or-list` 显示问题列表或空态。
- `account-actions-back-context` 可从 monitoring 动作栏或配置策略区到达；账户诊断页只内嵌候选，不导航到本页。

## How to get to it (user POV)

- 打开 `#/demo/monitoring/account-actions`。
- 使用 monitoring 动作栏或配置里的 auth issues 站内链接（页面有 `Back to Monitoring`）。

## Driving it with control-cpamp

Preconditions:

- Demo 面板健康。
- `doctor` 为绿。

- **Hash 入口。** 打开账户动作路由。执行 `control-cpamp goto --hash '#/demo/monitoring/account-actions'`。页面显示 `Auth Issue Handling` 或等价工作区文案。
- **列表或空态。** 等待内容。执行 `control-cpamp wait --text 'Auth Issue Handling'`。出现问题行或 `No auth issues`。
- **证明。** 捕获工作区。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/account-actions.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/account-actions.png`。

## Gotchas

- 非 demo 模式下本路由受 request monitoring 门控。
- 在 live Manager Server 上做破坏性恢复会改凭证。使用一次性数据，或只做只读证明后停止。
