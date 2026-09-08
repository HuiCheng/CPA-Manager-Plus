---
name: verify-cpamp
description: "按用户方式驱动 CPA Manager Plus 演示管理面板（`#/demo` 下的 hash 路由）。在需要证明 UI 行为、校验 feature map 路径，或执行 CPAMP 的 Launch/Doctor/Drive/Evidence/Cleanup 时使用。"
---

# Verify CPA Manager Plus

面向 agent 的 CPA Manager Plus 管理面板控制技能。

主表面是 **demo site**（`npm run dev:demo`）。它在 `#/demo/*` 加载 fixture 数据，不需要 CPA 或 Manager Server。次要表面（对接真实 Manager Server 或 CPA Panel 的登录）已写入地图，但标了 live 前置条件。

不要驱动本轮未由本技能启动的面板实例。

## Launch

在仓库根目录执行：

```bash
export CPAMP_VERIFY_RUN_ID="${CPAMP_VERIFY_RUN_ID:-$(date +%Y%m%d-%H%M%S)-$$}"
export CPAMP_VERIFY_PORT="${CPAMP_VERIFY_PORT:-4173}"
export CPAMP_VERIFY_CHROME_PORT="${CPAMP_VERIFY_CHROME_PORT:-9222}"
./.cursor/skills/verify-cpamp/scripts/launch.sh
```

启动过程：

1. 在 `apps/web` 直接启动 Vite：`vite --mode demo --host 127.0.0.1 --port $CPAMP_VERIFY_PORT --strictPort`（避免 npm workspace 吞掉参数）。
2. 用一次性 profile 打开 Google Chrome，并在 `$CPAMP_VERIFY_CHROME_PORT` 开启 remote debugging。
3. 打开 `http://127.0.0.1:$PORT/#/demo`，等到 Dashboard shell 可见。
4. 把运行状态写到 `$CPAMP_VERIFY_ROOT/$CPAMP_VERIFY_RUN_ID/state.json`（默认根目录 `/tmp/cpamp-verify`）。

同文档 hash 变更会走 `location.hash`。需要证明真实用户路径时，优先点侧栏，而不是只改深链。

就绪信号：`launch` 打印 `"ok": true` 的 JSON，之后 `doctor` 全部检查为 true。

拆除：`./.cursor/skills/verify-cpamp/scripts/cleanup.sh`（见 Cleanup）。

若缺少 `scripts/node_modules`，先在 `.cursor/skills/verify-cpamp/scripts` 执行一次 `npm install`。

## Doctor

对当前 run 做只读健康检查：

```bash
./.cursor/skills/verify-cpamp/scripts/doctor.sh
```

要求 Vite PID、Chrome PID、HTTP base URL、Chrome debug 端点，以及 demo shell 文案（`Dashboard` / `Credential Management` / `Request Monitor`）全部通过。退出码 `2` 表示不要继续 Drive。先 relaunch 或 cleanup。

## Drive

使用 `control-cpamp` 包装器。优先用 hash 导航，以及 `apps/web/src/i18n/locales/en.json` 里的英文可访问名称。

```bash
CTRL=./.cursor/skills/verify-cpamp/scripts/control-cpamp

$CTRL goto --hash '#/demo/monitoring'
$CTRL click --role link --name 'Request Monitor'
$CTRL click --role tab --name 'Realtime'
$CTRL wait --text 'Realtime'
$CTRL snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/monitoring.aria.txt
$CTRL screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/monitoring.png
```

稳定句柄：

| 类型 | 示例 |
| --- | --- |
| Hash routes | `#/demo`, `#/demo/monitoring`, `#/demo/accounts?view=health&healthMode=local` |
| Nav links | `Dashboard`, `Usage Analytics`, `Request Monitor`, `Logs Viewer`, `Plugins`, `Config Panel`, `AI Providers`, `Credential Management`, `OAuth Login`, `System Info` |
| Header controls | `Refresh All`, `Language`, `Theme`, `Visual effects`, `Logout` |
| Accounts views | tabs `Credential List`, `Health Inspection`, `OAuth Configuration` |
| Monitoring data tabs | `Accounts`, `Client Keys`, `Realtime` |
| Config tabs | `Visual Editor`, `Source File Editor`, `CPA Manager Plus Configuration` |
| Plugin tabs | `Installed`, `Plugin Store` |

Demo 路径在 `/demo` route base 下镜像生产路径。生产登录在 `#/login`，需要 live backend。见 `features/login-and-setup.md`。

Drive 前先读 `features/README.md`，再用对应 feature 文件当配方。地图列出了多个入口时，只打一个顺手入口不算完整证明。

## Evidence

默认产物目录：

`.cursor/skills/verify-cpamp/artifacts/<run-id>/`

证明标准：

- 走真实用户路径（侧栏点击或文档化的 hash）。不要注入 Zustand store，也不要调用仅测试用的 hook。
- 同时捕获动作与结果态。保留 ARIA snapshot 和能看出面板身份的截图（`CPA Manager Plus` 品牌或页面标题）。
- Demo 模式里的变更，动作后要再读一次 UI。Fixture 可能在 reload 后重置。优先可 reload 的断言。
- Live Manager Server / CPA 路径可能改真实数据。使用一次性 data dir 与 admin key，或把该路径标为 `verified-unreachable` 并写明缺失前置条件。
- Cleanup 不得删除 evidence。

## Cleanup

```bash
./.cursor/skills/verify-cpamp/scripts/cleanup.sh
# optional: also drop chrome profile + state file
./.cursor/skills/verify-cpamp/scripts/cleanup.sh --all
```

Cleanup 只杀掉本 run 的 state 文件里记录的 Vite 与 Chrome PID。绝不按进程名杀。`artifacts/<run-id>/` 下的 evidence 会保留。

## Helpers

| 命令 | 用途 |
| --- | --- |
| `scripts/launch.sh` | 为本 run 启动 demo Vite + Chrome |
| `scripts/doctor.sh` | 只读就绪检查 |
| `scripts/cleanup.sh` | 按 state 拆除 PID |
| `scripts/control-cpamp` | Drive 命令（`goto`, `click`, `fill`, `wait`, `snapshot`, `screenshot`, `text`, `launch`, `doctor`, `cleanup`） |

Harness 依赖安装一次：

```bash
npm install --prefix .cursor/skills/verify-cpamp/scripts
```

环境变量：`CPAMP_VERIFY_RUN_ID`, `CPAMP_VERIFY_ROOT`, `CPAMP_VERIFY_PORT`, `CPAMP_VERIFY_BASE_URL`, `CPAMP_VERIFY_ARTIFACTS`, `CPAMP_VERIFY_CHROME`, `CPAMP_VERIFY_CHROME_PORT`。

## Isolate

- 并发 run 使用独立的 `CPAMP_VERIFY_PORT` / `CPAMP_VERIFY_CHROME_PORT` 组合。
- Chrome 使用 `$CPAMP_VERIFY_ROOT/$RUN_ID/chrome-profile`。不要复用个人 profile。
- Demo 模式自包含。Full Docker（`docker compose -f docker-compose.manager.yml`）与 CPA Panel 登录共享真实 CPA 状态。拒绝双开驱动共享 live 实例。

## Feature map

见 [features/README.md](features/README.md)。
