# 插件

插件管理让运维查看已安装插件、打开插件商店，并在服务器支持插件时进入插件提供的资源页。

## Sub-features

- `plugins-open` 打开 Plugin Management。
- `plugins-installed` 显示 Installed 页签。
- `plugins-store` 显示 Plugin Store 页签以及 `/plugin-store` 重定向。
- `plugins-resource` 打开如 Request Insights、Account Auditor 等 demo 插件资源页。

## How to get to it (user POV)

- 在侧栏选择 `Plugins`。
- 打开 `#/demo/plugins`。
- 打开 `#/demo/plugins?tab=store`。
- 打开 `#/demo/plugin-store` 并接受重定向到 `#/demo/plugins?tab=store`。
- 当插件注册菜单时，打开 `#/demo/plugin-pages/<pluginId>/<menuIndex>`。
- 当 demo 侧栏注册了这些菜单时，选择 `Request Insights` 或 `Account Auditor`。

## Driving it with control-cpamp

Preconditions:

- Demo 面板健康。
- `doctor` 为绿。
- Demo 模式即使 live CPA 构建会隐藏插件，也会暴露插件入口。

- **导航入口。** 选择 `Plugins`。执行 `control-cpamp click --role link --name 'Plugins'`。页面显示 `Plugin Management`。
- **Installed 页签。** 选择 `Installed`。执行 `control-cpamp click --role tab --name 'Installed'`。已安装插件内容可见。
- **Store 页签。** 选择 `Plugin Store`。执行 `control-cpamp click --role tab --name 'Plugin Store'`。商店内容可见。
- **Store 重定向。** 打开旧商店 hash。执行 `control-cpamp goto --hash '#/demo/plugin-store'`。最终停在 plugins 下的 store 页签。
- **资源页。** 选择 `Request Insights` 或打开 `#/demo/plugin-pages/request-insights/0`。执行 `control-cpamp click --role link --name 'Request Insights'` 或 `control-cpamp goto --hash '#/demo/plugin-pages/request-insights/0'`。对 `Account Auditor` / `#/demo/plugin-pages/account-auditor/0` 同样处理。每个资源页在 shell 内渲染。
- **证明。** 捕获 Installed 或 Store。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/plugins.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/plugins.png`。

## Gotchas

- 不支持插件的 live CPA 构建会把 `/plugins` 重定向到 Dashboard。
- Live 服务器上安装/卸载会改 CPA 插件。共享环境优先只读证明。
