# 凭证管理

凭证管理是统一账户工作区，覆盖凭证列表、健康检查、OAuth 配置与单账户详情页签。

## Sub-features

- `accounts-list` 打开 Credential List 视图。
- `accounts-health-local` 打开 local 模式 Health Inspection。
- `accounts-health-server` 打开 server 模式 Health Inspection。
- `accounts-oauth-view` 打开 accounts 内的 OAuth Configuration 视图。
- `accounts-detail-overview` 打开账户详情 Overview 页签。
- `accounts-detail-quota` 打开 Quota 页签。
- `accounts-detail-config` 打开 Settings 页签。
- `accounts-detail-models` 打开 Models 页签。
- `accounts-detail-diagnostics` 打开 Diagnostics 页签。
- `accounts-legacy-redirects` 跟随旧 codex-inspection hash 进入 health 视图。

## How to get to it (user POV)

- 在侧栏选择 `Credential Management`。
- 打开 `#/demo/accounts`。
- 打开 `#/demo/accounts?view=health&healthMode=local`。
- 打开 `#/demo/accounts?view=health&healthMode=server`。
- 打开 `#/demo/accounts?view=oauth`。
- 打开账户详情 hash，例如 `#/demo/accounts?account=<id>&tab=overview`。
- 打开旧 `#/demo/codex-inspection` 或 `#/demo/codex-inspection/server`，并接受重定向到 accounts health。

## Driving it with control-cpamp

Preconditions:

- Demo 面板健康。
- `doctor` 为绿。
- 证明详情页签时，demo fixture 至少包含一行凭证。

- **列表入口。** 选择 `Credential Management`。执行 `control-cpamp click --role link --name 'Credential Management'`。页面显示 `Credential Management`。
- **Credential List 页签。** 选择 `Credential List`。执行 `control-cpamp click --role tab --name 'Credential List'`。列表视图激活。
- **Health local。** 打开 local health。执行 `control-cpamp goto --hash '#/demo/accounts?view=health&healthMode=local'`。Health Inspection 内容可见。
- **Health server。** 打开 server health。执行 `control-cpamp goto --hash '#/demo/accounts?view=health&healthMode=server'`。Server health 内容可见。
- **OAuth 视图。** 打开 accounts OAuth 配置。执行 `control-cpamp goto --hash '#/demo/accounts?view=oauth'`。OAuth Configuration 内容可见。
- **旧 local 重定向。** 打开 `#/demo/codex-inspection`。执行 `control-cpamp goto --hash '#/demo/codex-inspection'`。最终为 accounts health 的 local 模式。
- **旧 server 重定向。** 打开 `#/demo/codex-inspection/server`。执行 `control-cpamp goto --hash '#/demo/codex-inspection/server'`。最终为 accounts health 的 server 模式。
- **详情页签。** 打开一个 fixture 账户，并用 `tab=overview`、`tab=quota`、`tab=config`、`tab=models`、`tab=diagnostics` 切换。每个页签显示对应标签面板。
- **证明。** 捕获 Credential List 或 Health Inspection。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/accounts.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/accounts.png`。

## Gotchas

- `account` 查询值里的选择键可能含 null 分隔符。从 UI 或 fixture 文档复制，不要自造。
- Health 动作与 quota cooldown 会改 live 凭证。写证明保持可丢弃。
- `view=inspection` 可作为 health 别名。新配方优先写 `view=health`。
