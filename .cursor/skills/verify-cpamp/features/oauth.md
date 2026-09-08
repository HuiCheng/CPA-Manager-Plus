# OAuth 登录

OAuth 登录为 Codex、Anthropic、Antigravity、Kimi、xAI 以及插件提供的 OAuth 条目启动提供商 OAuth 流程。

## Sub-features

- `oauth-open` 打开独立 OAuth Login 页。
- `oauth-provider-cards` 显示内置提供商卡片与启动按钮。
- `oauth-start-readiness` 证明启动控件存在；除非配置了可丢弃提供商，否则不完成外部浏览器登录。

## How to get to it (user POV)

- 在侧栏选择 `OAuth Login`。
- 打开 `#/demo/oauth`。
- 当 fixture 提供时，打开如 `#/demo/oauth?provider=demo` 的提供商深链。

## Driving it with control-cpamp

Preconditions:

- Demo 面板健康。
- `doctor` 为绿。

- **导航入口。** 选择 `OAuth Login`。执行 `control-cpamp click --role link --name 'OAuth Login'`。OAuth 提供商卡片可见。
- **Hash 入口。** 打开 `#/demo/oauth`。执行 `control-cpamp goto --hash '#/demo/oauth'`。同一页面仍可见。
- **提供商存在。** 等待内置提供商标题如 `Codex OAuth`。执行 `control-cpamp wait --text 'Codex OAuth'`。存在如 `Start Codex Login` 的启动控件。
- **证明。** 捕获提供商列表。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/oauth.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/oauth.png`。

## Gotchas

- 完成真实 OAuth 握手需要外部 IdP，并会写入 auth 文件。除非环境可丢弃且本意就是跑该流程，否则停在启动控件就绪。
- Accounts 里也有 OAuth Configuration 视图。本文件只覆盖独立 `#/oauth` 页。
