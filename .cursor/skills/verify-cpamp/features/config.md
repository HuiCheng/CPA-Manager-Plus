# 配置面板

配置面板以可视化方式、源 YAML，以及（可用时）Manager Server 连接设置编辑 CPA 配置。

## Sub-features

- `config-open` 从导航、hash 或旧重定向打开 Config Panel。
- `config-visual` 显示 Visual Editor 页签。
- `config-source` 显示 Source File Editor 页签。
- `config-manager` 在 Manager 托管可用时显示 CPA Manager Plus Configuration 页签。

## How to get to it (user POV)

- 在侧栏选择 `Config Panel`。
- 打开 `#/demo/config`。
- 打开 `#/demo/settings` 或 `#/demo/api-keys`，并接受重定向到 `#/demo/config`。

## Driving it with control-cpamp

Preconditions:

- Demo 面板健康。
- `doctor` 为绿。

- **导航入口。** 选择 `Config Panel`。执行 `control-cpamp click --role link --name 'Config Panel'`。页面显示配置编辑器壳层。
- **旧重定向。** 打开 `#/demo/settings`，再打开 `#/demo/api-keys`。执行 `control-cpamp goto --hash '#/demo/settings'` 与 `control-cpamp goto --hash '#/demo/api-keys'`。两者最终都停在 Config Panel。
- **Visual 页签。** 选择 `Visual Editor`。执行 `control-cpamp click --role tab --name 'Visual Editor'`。可视化分区可见。
- **Source 页签。** 选择 `Source File Editor`。执行 `control-cpamp click --role tab --name 'Source File Editor'`。源编辑器可见。
- **Manager 页签。** 若显示，选择 `CPA Manager Plus Configuration`。执行 `control-cpamp click --role tab --name 'CPA Manager Plus Configuration'`。Manager 连接字段可见。
- **证明。** 捕获其中一个页签。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/config.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/config.png`。

## Gotchas

- 未保存的 source 编辑可能阻止切换页签。切换前先丢弃或保存。
- 在 live CPA 上保存配置会改运行时配置。写证明使用一次性实例。
