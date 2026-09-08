# Credential management

Credential management is the unified accounts workspace for credential list, health inspection, OAuth configuration, and per-account detail tabs.

## Sub-features

- `accounts-list` opens the Credential List view.
- `accounts-health-local` opens Health Inspection in local mode.
- `accounts-health-server` opens Health Inspection in server mode.
- `accounts-oauth-view` opens the OAuth Configuration view inside accounts.
- `accounts-detail-overview` opens an account detail Overview tab.
- `accounts-detail-quota` opens the Quota tab.
- `accounts-detail-config` opens the Settings tab.
- `accounts-detail-models` opens the Models tab.
- `accounts-detail-diagnostics` opens the Diagnostics tab.
- `accounts-legacy-redirects` follows legacy codex-inspection hashes into health view.

## How to get to it (user POV)

- Choose `Credential Management` in the sidebar.
- Open `#/demo/accounts`.
- Open `#/demo/accounts?view=health&healthMode=local`.
- Open `#/demo/accounts?view=health&healthMode=server`.
- Open `#/demo/accounts?view=oauth`.
- Open an account detail hash such as `#/demo/accounts?account=<id>&tab=overview`.
- Open legacy `#/demo/codex-inspection` or `#/demo/codex-inspection/server` and accept the redirect into accounts health.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy.
- `doctor` is green.
- Demo fixtures include at least one credential row when proving detail tabs.

- **List entry.** Choose `Credential Management`. Run `control-cpamp click --role link --name 'Credential Management'`. The page shows `Credential Management`.
- **Credential List tab.** Choose `Credential List`. Run `control-cpamp click --role tab --name 'Credential List'`. The list view is active.
- **Health local.** Open local health. Run `control-cpamp goto --hash '#/demo/accounts?view=health&healthMode=local'`. Health Inspection content is visible.
- **Health server.** Open server health. Run `control-cpamp goto --hash '#/demo/accounts?view=health&healthMode=server'`. Server health content is visible.
- **OAuth view.** Open accounts OAuth configuration. Run `control-cpamp goto --hash '#/demo/accounts?view=oauth'`. OAuth Configuration content is visible.
- **Legacy local redirect.** Open `#/demo/codex-inspection`. Run `control-cpamp goto --hash '#/demo/codex-inspection'`. The end state is accounts health in local mode.
- **Legacy server redirect.** Open `#/demo/codex-inspection/server`. Run `control-cpamp goto --hash '#/demo/codex-inspection/server'`. The end state is accounts health in server mode.
- **Detail tabs.** Open a fixture account and cycle tabs with `tab=overview`, `tab=quota`, `tab=config`, `tab=models`, and `tab=diagnostics`. Each tab shows its labeled panel.
- **Proof.** Capture Credential List or Health Inspection. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/accounts.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/accounts.png`.

## Gotchas

- Account selection keys can include a null separator in the `account` query value. Copy the key from the UI or fixture docs. Do not invent one.
- Health actions and quota cooldowns mutate live credentials. Keep write proofs disposable.
- `view=inspection` is accepted as an alias for health. Prefer `view=health` in new recipes.
