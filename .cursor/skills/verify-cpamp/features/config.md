# Config panel

Config panel edits CPA configuration visually, as source YAML, and through Manager Server connection settings when available.

## Sub-features

- `config-open` opens Config Panel from nav, hash, or legacy redirects.
- `config-visual` shows the Visual Editor tab.
- `config-source` shows the Source File Editor tab.
- `config-manager` shows the CPA Manager Plus Configuration tab when Manager hosting is available.

## How to get to it (user POV)

- Choose `Config Panel` in the sidebar.
- Open `#/demo/config`.
- Open `#/demo/settings` or `#/demo/api-keys` and accept the redirect to `#/demo/config`.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy.
- `doctor` is green.

- **Nav entry.** Choose `Config Panel`. Run `control-cpamp click --role link --name 'Config Panel'`. The page shows config editor chrome.
- **Legacy redirects.** Open `#/demo/settings` then `#/demo/api-keys`. Run `control-cpamp goto --hash '#/demo/settings'` and `control-cpamp goto --hash '#/demo/api-keys'`. Both end on Config Panel.
- **Visual tab.** Choose `Visual Editor`. Run `control-cpamp click --role tab --name 'Visual Editor'`. Visual sections are visible.
- **Source tab.** Choose `Source File Editor`. Run `control-cpamp click --role tab --name 'Source File Editor'`. The source editor is visible.
- **Manager tab.** If shown, choose `CPA Manager Plus Configuration`. Run `control-cpamp click --role tab --name 'CPA Manager Plus Configuration'`. Manager connection fields are visible.
- **Proof.** Capture one tab. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/config.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/config.png`.

## Gotchas

- Unsaved source edits can block tab changes. Discard or save before switching tabs.
- Saving config on a live CPA mutates runtime configuration. Use disposable instances for write proofs.
