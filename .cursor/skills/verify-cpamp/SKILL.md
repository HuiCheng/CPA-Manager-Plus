---
name: verify-cpamp
description: "Drive CPA Manager Plus the way a user does through the demo management panel (hash routes under #/demo). Use when proving UI behavior, validating a feature map path, or checking Launch/Doctor/Drive/Evidence/Cleanup for CPAMP."
---

# Verify CPA Manager Plus

Agent-facing control skill for the CPA Manager Plus management panel.

Primary surface is the **demo site** (`npm run dev:demo`). It loads fixture data under `#/demo/*` and does not need CPA or Manager Server. Secondary surfaces (login against a live Manager Server or CPA Panel) are mapped but marked with live preconditions.

Never drive a panel instance you did not launch for this run.

## Launch

From the repo root:

```bash
export CPAMP_VERIFY_RUN_ID="${CPAMP_VERIFY_RUN_ID:-$(date +%Y%m%d-%H%M%S)-$$}"
export CPAMP_VERIFY_PORT="${CPAMP_VERIFY_PORT:-4173}"
export CPAMP_VERIFY_CHROME_PORT="${CPAMP_VERIFY_CHROME_PORT:-9222}"
./.cursor/skills/verify-cpamp/scripts/launch.sh
```

What this does:

1. Starts Vite directly from `apps/web` as `vite --mode demo --host 127.0.0.1 --port $CPAMP_VERIFY_PORT --strictPort` (avoids npm workspace arg stripping).
2. Opens Google Chrome with a disposable profile and remote debugging on `$CPAMP_VERIFY_CHROME_PORT`.
3. Navigates to `http://127.0.0.1:$PORT/#/demo` and waits until the Dashboard shell is visible.
4. Writes run state under `$CPAMP_VERIFY_ROOT/$CPAMP_VERIFY_RUN_ID/state.json` (default root `/tmp/cpamp-verify`).

Same-document hash changes use `location.hash` so React Router updates. Prefer nav clicks when a recipe needs the user path rather than only the deep link.

Ready signal: `launch` prints JSON with `"ok": true` and `doctor` later reports all checks true.

Teardown: `./.cursor/skills/verify-cpamp/scripts/cleanup.sh` (see Cleanup).

If `scripts/node_modules` is missing, run `npm install` inside `.cursor/skills/verify-cpamp/scripts` once.

## Doctor

Read-only health check for the current run:

```bash
./.cursor/skills/verify-cpamp/scripts/doctor.sh
```

Requires the Vite PID, Chrome PID, HTTP base URL, Chrome debug endpoint, and demo shell text (`Dashboard` / `Credential Management` / `Request Monitor`) to all pass. Exit code `2` means do not drive. Relaunch or cleanup first.

## Drive

Use the `control-cpamp` wrapper. Prefer hash navigation and English accessible names from `apps/web/src/i18n/locales/en.json`.

```bash
CTRL=./.cursor/skills/verify-cpamp/scripts/control-cpamp

$CTRL goto --hash '#/demo/monitoring'
$CTRL click --role link --name 'Request Monitor'
$CTRL click --role tab --name 'Realtime'
$CTRL wait --text 'Realtime'
$CTRL snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/monitoring.aria.txt
$CTRL screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/monitoring.png
```

Stable handles:

| Kind | Examples |
| --- | --- |
| Hash routes | `#/demo`, `#/demo/monitoring`, `#/demo/accounts?view=health&healthMode=local` |
| Nav links | `Dashboard`, `Usage Analytics`, `Request Monitor`, `Logs Viewer`, `Plugins`, `Config Panel`, `AI Providers`, `Credential Management`, `OAuth Login`, `System Info` |
| Header controls | `Refresh All`, `Language`, `Theme`, `Visual effects`, `Logout` |
| Accounts views | tabs `Credential List`, `Health Inspection`, `OAuth Configuration` |
| Monitoring data tabs | `Accounts`, `Client Keys`, `Realtime` |
| Config tabs | `Visual Editor`, `Source File Editor`, `CPA Manager Plus Configuration` |
| Plugin tabs | `Installed`, `Plugin Store` |

Demo paths mirror production paths under the `/demo` route base. Production login lives at `#/login` and needs a live backend. See `features/login-and-setup.md`.

Read `features/README.md` before a drive. Use the matching feature file as the recipe. A proof that only hits one convenient entry point is incomplete when the map lists others.

## Evidence

Default artifact directory:

`.cursor/skills/verify-cpamp/artifacts/<run-id>/`

Proof standards:

- Exercise the real user path (nav click or documented hash). Do not seed Zustand stores or call test-only hooks.
- Capture the action and the resulting state. Keep both an ARIA snapshot and a screenshot that shows panel identity (`CPA Manager Plus` branding or the page title).
- For mutations in demo mode, re-read the UI after the action. Demo fixtures may reset on reload. Prefer reload-safe assertions.
- Live Manager Server / CPA paths may mutate real data. Use a disposable data dir and admin key, or mark the path `verified-unreachable` with the missing precondition.
- Cleanup must not delete evidence.

## Cleanup

```bash
./.cursor/skills/verify-cpamp/scripts/cleanup.sh
# optional: also drop chrome profile + state file
./.cursor/skills/verify-cpamp/scripts/cleanup.sh --all
```

Cleanup kills only the Vite and Chrome PIDs recorded in this run's state file. It never kills by process name. Evidence under `artifacts/<run-id>/` survives.

## Helpers

| Command | Purpose |
| --- | --- |
| `scripts/launch.sh` | Start demo Vite + Chrome for this run |
| `scripts/doctor.sh` | Read-only readiness check |
| `scripts/cleanup.sh` | Tear down PIDs from state |
| `scripts/control-cpamp` | Drive commands (`goto`, `click`, `fill`, `wait`, `snapshot`, `screenshot`, `text`, `launch`, `doctor`, `cleanup`) |

Install harness deps once:

```bash
npm install --prefix .cursor/skills/verify-cpamp/scripts
```

Environment knobs: `CPAMP_VERIFY_RUN_ID`, `CPAMP_VERIFY_ROOT`, `CPAMP_VERIFY_PORT`, `CPAMP_VERIFY_BASE_URL`, `CPAMP_VERIFY_ARTIFACTS`, `CPAMP_VERIFY_CHROME`, `CPAMP_VERIFY_CHROME_PORT`.

## Isolate

- Use a dedicated `CPAMP_VERIFY_PORT` / `CPAMP_VERIFY_CHROME_PORT` pair per concurrent run.
- Chrome uses `$CPAMP_VERIFY_ROOT/$RUN_ID/chrome-profile`. Do not reuse a personal profile.
- Demo mode is self-contained. Full Docker (`docker compose -f docker-compose.manager.yml`) and CPA Panel login share real CPA state. Refuse to double-drive a shared live instance.

## Feature map

See [features/README.md](features/README.md).
