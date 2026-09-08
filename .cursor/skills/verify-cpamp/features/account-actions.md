# Auth issue handling

Auth issue handling lists credential failures routed into the account action queue for review and recovery.

## Sub-features

- `account-actions-open` opens the auth issues workspace.
- `account-actions-empty-or-list` shows either the issue list or the empty state.
- `account-actions-back-context` remains reachable from monitoring-related workflows.

## How to get to it (user POV)

- Open `#/demo/monitoring/account-actions`.
- Use in-app links labeled for auth issues when shown from monitoring or account diagnostics.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy.
- `doctor` is green.

- **Hash entry.** Open the account actions route. Run `control-cpamp goto --hash '#/demo/monitoring/account-actions'`. The page shows `Auth Issue Handling` or equivalent issue workspace copy.
- **List or empty.** Wait for content. Run `control-cpamp wait --text 'Auth Issue Handling'`. Either issue rows or `No auth issues` appear.
- **Proof.** Capture the workspace. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/account-actions.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/account-actions.png`.

## Gotchas

- This route is feature-gated on request monitoring outside demo mode.
- Destructive recovery actions on a live Manager Server mutate credentials. Use disposable data or stop after read-only proof.
