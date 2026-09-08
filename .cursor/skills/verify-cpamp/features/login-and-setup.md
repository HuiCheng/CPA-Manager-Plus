# 登录与初始化

登录与初始化让运维把面板接到 CPA，或在 Manager Server 首次启动时完成 admin key、CPA URL、CPA Management Key 与监控选项配置。

## Sub-features

- `login-panel` 打开 `#/login` 的 CPA Panel 连接表单。
- `login-manager-setup` 在面板由 Manager Server 托管且 setup 未完成时，走 setup wizard 步骤。
- `login-submit` 用当前凭证字段认证并进入受保护 shell。
- `login-errors` 展示校验与连接失败信息且不进入 shell。

## How to get to it (user POV)

- 在非 demo 面板构建上打开 `http://<host>/management.html#/login`。
- 打开会展示 setup wizard 的 Manager Server 首次启动 URL。
- 在已认证 live 会话中选择 `Logout` 返回登录。

## Driving it with control-cpamp

Preconditions:

- 有一次性 Manager Server 或 CPA Panel 端点在运行。
- 持有该实例对应的 Admin Key 或 CPA Management Key。
- 仅 demo launch 不够。没有 live backend 时，把本 feature 标为 `verified-unreachable`。

- **打开登录。** 导航到 live 面板登录 hash。对一次性主机执行 `control-cpamp goto --url 'http://127.0.0.1:18317/management.html#/login'`。表单显示 `Login` 与凭证字段（CPA Panel 为 `CPA Management Key`）。
- **CPA Panel 连接。** 填写 management key 并选择 `Login`。执行 `control-cpamp fill --name 'CPA Management Key' --value '<key>'`，再执行 `control-cpamp click --role button --name 'Login'`。受保护 shell 出现。
- **Manager setup。** 在首次 Manager Server 上，按标签完成 Admin Key、CPA Connection、CPA Management Key、monitoring、polling、review，然后提交。shell 打开到 Dashboard。
- **校验失败。** 提交空必填字段。页面显示必填错误并停留在登录或 setup。
- **证明。** 登录成功后捕获 shell。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/login.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/login.png`。产物显示已认证导航 shell，而不是登录表单。

## Gotchas

- Demo 模式绕过登录。`#/demo` 不能证明 `#/login`。
- Manager Server 使用 `Admin Key`。CPA Panel 使用 `CPA Management Key`。Manager setup 步骤标签为 `CPA Key` / `Request Monitoring` / `Polling Interval`，提交为 `Initialize`。
- 不要把生产密钥写进验证日志或 artifacts。
