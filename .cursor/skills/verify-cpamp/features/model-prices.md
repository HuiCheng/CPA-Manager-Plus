# 模型定价

模型定价管理让运维查看已保存价格、同步候选，并确认成本分析使用的匹配结果。

## Sub-features

- `model-prices-open` 打开 Model Price Management。
- `model-prices-summary` 显示定价摘要计数。
- `model-prices-redirect` 跟随 monitoring 下的旧 model-prices 重定向到规范路由。

## How to get to it (user POV)

- 打开 `#/demo/model-prices`。
- 打开 `#/demo/monitoring/model-prices` 并接受重定向到 `#/demo/model-prices`。
- 使用用量分析或监控中展示的站内链接。

## Driving it with control-cpamp

Preconditions:

- Demo 面板健康。
- `doctor` 为绿。

- **规范入口。** 打开模型定价。执行 `control-cpamp goto --hash '#/demo/model-prices'`。页面显示 `Model Price Management`。
- **旧重定向。** 打开 monitoring 别名。执行 `control-cpamp goto --hash '#/demo/monitoring/model-prices'`。最终停在规范模型定价页。
- **摘要。** 等待定价摘要。执行 `control-cpamp wait --text 'Model Price Management'`。摘要或同步区域可见。
- **证明。** 捕获页面。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/model-prices.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/model-prices.png`。

## Gotchas

- Live 面板受 model-prices 可用性与 Manager Server 连通门控。
- 对外部价格源同步是 live 副作用。除非使用一次性 backend，否则优先只读证明。
