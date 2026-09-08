# Logs viewer

Logs viewer shows CPA file logs when logging to file is enabled, and exposes refresh, clear, download, and error-log helpers.

## Sub-features

- `logs-open` opens Logs Viewer from nav or hash.
- `logs-refresh` refreshes the log pane.
- `logs-empty-or-content` shows either log text or the empty state.

## How to get to it (user POV)

- Choose `Logs Viewer` in the sidebar.
- Open `#/demo/logs`.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy.
- `doctor` is green.

- **Nav entry.** Choose `Logs Viewer`. Run `control-cpamp click --role link --name 'Logs Viewer'`. The page shows `Logs Viewer`.
- **Hash entry.** Open `#/demo/logs`. Run `control-cpamp goto --hash '#/demo/logs'`. The same page remains visible.
- **Refresh control.** If `Refresh Logs` is present, choose it. Run `control-cpamp click --role button --name 'Refresh Logs'`. The viewer stays mounted.
- **Proof.** Capture content or empty state. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/logs.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/logs.png`.

## Gotchas

- Empty state copy appears when file logging is disabled. That is a valid end state.
- `Clear Logs` is destructive on live CPA. Skip it unless the instance is disposable.
