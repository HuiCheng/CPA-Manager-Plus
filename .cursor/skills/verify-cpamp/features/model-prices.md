# Model prices

Model price management lets operators review saved prices, sync candidates, and confirm matches used by cost analytics.

## Sub-features

- `model-prices-open` opens Model Price Management.
- `model-prices-summary` shows pricing summary counts.
- `model-prices-redirect` follows the legacy monitoring model-prices redirect to the canonical route.

## How to get to it (user POV)

- Open `#/demo/model-prices`.
- Open `#/demo/monitoring/model-prices` and accept the redirect to `#/demo/model-prices`.
- Use in-app links from usage analytics or monitoring when shown.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy.
- `doctor` is green.

- **Canonical entry.** Open model prices. Run `control-cpamp goto --hash '#/demo/model-prices'`. The page shows `Model Price Management`.
- **Legacy redirect.** Open the monitoring alias. Run `control-cpamp goto --hash '#/demo/monitoring/model-prices'`. The canonical model prices page remains the end state.
- **Summary.** Wait for pricing summary. Run `control-cpamp wait --text 'Model Price Management'`. Summary or sync regions are visible.
- **Proof.** Capture the page. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/model-prices.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/model-prices.png`.

## Gotchas

- Live panels gate this on model-prices availability and Manager Server connectivity.
- Sync against external price sources is a live side effect. Prefer read-only proof unless using a disposable backend.
