# System info

System info shows product identity, connection status, optional SQLite storage status, model inventory links, and clear-login helpers.

## Sub-features

- `system-open` opens System Info.
- `system-about` shows CPA Manager Plus identity.
- `system-database` shows SQLite storage status when Manager Server features are available.
- `system-clear-login` exposes clear-login controls without requiring activation during read-only proof.

## How to get to it (user POV)

- Choose `System Info` in the sidebar.
- Open `#/demo/system`.
- Open `#/demo/system?maintenance=degraded` to exercise the degraded maintenance fixture.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy.
- `doctor` is green.

- **Nav entry.** Choose `System Info`. Run `control-cpamp click --role link --name 'System Info'`. The page shows `System Info`.
- **Hash entry.** Open `#/demo/system`. Run `control-cpamp goto --hash '#/demo/system'`. About and status regions are visible.
- **Degraded fixture.** Open `#/demo/system?maintenance=degraded`. Run `control-cpamp goto --hash '#/demo/system?maintenance=degraded'`. Maintenance-related copy appears when the fixture is active.
- **Proof.** Capture System Info. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/system.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/system.png`.

## Gotchas

- Database status depends on Manager Server availability. Missing storage cards can still be a valid demo end state.
- Clear-login mutates local auth state. Prefer read-only proof unless intentionally testing logout recovery.
