# CPA Manager Plus verification map

Maintained source for verifying user-facing behavior of the CPA Manager Plus management panel. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch the demo panel with `./.cursor/skills/verify-cpamp/scripts/launch.sh`.
- Default URL is `http://127.0.0.1:4173/#/demo`.
- Set a unique `CPAMP_VERIFY_RUN_ID` so concurrent runs do not share Chrome profiles or state files.
- Put English UI labels in play. The demo defaults to the browser language. If labels differ, switch Language to `English` via the header control before asserting names.
- Run `./.cursor/skills/verify-cpamp/scripts/doctor.sh` and require `"ok": true`.
- Never drive an instance that was not started by this verification run.
- Live login, Manager Server setup, and destructive CPA mutations need a disposable backend. Without one, report those entry points as `verified-unreachable` with the missing precondition. Do not pretend a demo path covers them.

## Driving conventions

- Start every recipe from `#/demo` unless its preconditions say otherwise.
- Prefer ARIA roles and accessible names over CSS selectors or DOM position.
- Prefer documented hash routes when a deep link is a first-class user entry point.
- Treat every command as literal. Keep quoted names and flags unchanged.
- Run browser actions through `./.cursor/skills/verify-cpamp/scripts/control-cpamp`.
- Restore demo-safe state after a mutation when the recipe says so. Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot with panel identity visible.
- Mutation proof includes a second user-facing read of the changed value.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with control-cpamp` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Dashboard](./dashboard.md) covers the home overview under `#/demo`.
- [Login and setup](./login-and-setup.md) covers `#/login`, Manager Server setup wizard steps, and CPA Panel connect.
- [Usage analytics](./usage-analytics.md) covers cost and usage analytics.
- [Request monitor](./monitoring-center.md) covers monitoring data tabs and request inspection.
- [Auth issue handling](./account-actions.md) covers `#/demo/monitoring/account-actions`.
- [Model prices](./model-prices.md) covers `#/demo/model-prices` and the monitoring redirect.
- [Logs viewer](./logs.md) covers CPA log viewing controls.
- [Plugins](./plugins.md) covers installed plugins, plugin store, and plugin resource pages.
- [Config panel](./config.md) covers visual, source, and Manager configuration tabs.
- [AI providers](./ai-providers.md) covers provider list and per-provider create/edit routes.
- [Credential management](./accounts.md) covers account list, health inspection, OAuth config, and detail tabs.
- [OAuth login](./oauth.md) covers the standalone OAuth page.
- [System info](./system.md) covers system status, database status, and clear-login actions.
- [Shell chrome](./shell-chrome.md) covers header refresh, language, theme, visual effects, logout, and mobile nav.
