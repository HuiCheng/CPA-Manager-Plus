# Usage analytics

Usage analytics shows calls, tokens, cost, and trend breakdowns for the connected usage dataset.

## Sub-features

- `usage-open` opens the analytics page from nav or hash.
- `usage-overview` shows the analytics title and primary overview regions.
- `usage-empty-or-data` distinguishes fixture or live data from the empty and error states.

## How to get to it (user POV)

- Choose `Usage Analytics` in the sidebar.
- Open `#/demo/usage-analytics`.
- Follow documentation links to the Usage Analytics demo.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy.
- `doctor` is green.

- **Nav entry.** Choose `Usage Analytics`. Run `control-cpamp click --role link --name 'Usage Analytics'`. The page heading area includes `Usage Analytics`.
- **Hash entry.** Open the deep link. Run `control-cpamp goto --hash '#/demo/usage-analytics'`. The same page remains visible.
- **Content.** Wait for analytics content or empty state. Run `control-cpamp wait --text 'Usage Analytics'`. Either overview widgets or `No usage data` appear. Do not treat a spinner that never resolves as success.
- **Proof.** Capture the page. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/usage-analytics.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/usage-analytics.png`.

## Gotchas

- Outside demo mode this route is feature-gated on request monitoring availability. An unavailable live panel redirects to Config Panel.
- Charts can take a moment to paint. Wait for title text or empty/error copy, not a fixed sleep alone.
