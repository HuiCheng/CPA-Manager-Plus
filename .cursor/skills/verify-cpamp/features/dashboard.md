# Dashboard

Dashboard is the demo home overview. It shows traffic, collector, and health summary cards after the panel loads under `#/demo`.

## Sub-features

- `dashboard-open` opens the home overview from nav or the demo root hash.
- `dashboard-refresh` refreshes header-driven dashboard data without leaving the page.
- `dashboard-identity` shows CPA Manager Plus branding in the shell.

## How to get to it (user POV)

- Open `http://127.0.0.1:4173/#/demo`.
- Open `http://127.0.0.1:4173/#/demo/dashboard`.
- Choose the `Dashboard` item in the sidebar navigation.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy at `http://127.0.0.1:4173/#/demo`.
- `control-cpamp doctor` reports `"ok": true`.

- **Root entry.** Open the demo root. Run `control-cpamp goto --hash '#/demo'`. The page shows `Dashboard` and welcome copy.
- **Nav entry.** Choose `Dashboard`. Run `control-cpamp click --role link --name 'Dashboard'`. The active shell route remains the dashboard overview.
- **Alias entry.** Open the dashboard alias. Run `control-cpamp goto --hash '#/demo/dashboard'`. The same overview remains visible.
- **Refresh.** Choose `Refresh All`. Run `control-cpamp click --role button --name 'Refresh All'`. The page stays on Dashboard and continues to show overview content.
- **Proof.** Capture the overview. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/dashboard.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/dashboard.png`. Both artifacts show Dashboard content and panel identity.

## Gotchas

- Hash router URLs must include `#/demo`, not `/demo` alone, when opening from a fresh browser document URL.
- Collapsed sidebar may hide nav labels. Expand the sidebar or use hash navigation if the `Dashboard` name is missing from the AX tree.
- Demo collector and health cards are fixtures. Do not assert live CPA queue connectivity here.
