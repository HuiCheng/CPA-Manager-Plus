# 壳层控件

壳层控件覆盖环绕每个已认证或 demo 页面的共享 header 与导航控件。

## Sub-features

- `shell-nav` 到达主要侧栏目的地。
- `shell-refresh` 触发 `Refresh All`。
- `shell-language` 打开语言菜单。
- `shell-theme` 打开主题菜单。
- `shell-visual-effects` 打开视觉效果菜单。
- `shell-logout` 暴露 Logout。
- `shell-mobile-nav` 在窄视口切换移动端侧栏。

## How to get to it (user POV)

- 在任意 demo 页使用侧栏导航。
- 使用标为 `Refresh All`、`Language`、`Theme`、`Visual effects`、`Logout` 的 header 按钮。
- 在窄视口使用移动端导航开关（AX 名 `Expand sidebar` / `Collapse sidebar`）。

## Driving it with control-cpamp

Preconditions:

- Demo 面板在任意 `#/demo` 页健康。
- `doctor` 为绿。

- **语言菜单。** 选择 `Language`。执行 `control-cpamp click --role button --name 'Language'`。出现如 `English` 的语言选项。
- **主题菜单。** 选择 `Theme`。执行 `control-cpamp click --role button --name 'Theme'`。出现主题选项 `Auto`、`Light`、`Dark`。
- **视觉效果菜单。** 选择 `Visual effects`。执行 `control-cpamp click --role button --name 'Visual effects'`。出现选项 `Full effects` 与 `Performance`。
- **刷新。** 选择 `Refresh All`。执行 `control-cpamp click --role button --name 'Refresh All'`。当前页面仍挂载。
- **Logout 存在。** 确认存在 `Logout`。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/shell.aria.txt`。snapshot 包含 `Logout`。
- **证明。** 在主页面可见时捕获 shell。执行 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/shell.png`。

## Gotchas

- 选择非英语语言会改变后续步骤的 accessible name。在断言英文标签的配方前切回 `English`。
- Demo logout 返回 demo 根路径，而不是 live 登录表单。
- 移动端导航标签依赖视口宽度。断言移动开关前先设窄窗口；不要用不存在的通用 “mobile nav” 文案。
