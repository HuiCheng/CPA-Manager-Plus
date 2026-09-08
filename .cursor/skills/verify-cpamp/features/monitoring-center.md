# Request monitor

Request monitor is the persistent request history workspace. Users inspect account, client key, and realtime views, then drill into failures and filters.

## Sub-features

- `monitoring-open` opens Request Monitor from nav or hash.
- `monitoring-tab-accounts` shows the Accounts data tab.
- `monitoring-tab-api-keys` shows the Client Keys data tab.
- `monitoring-tab-realtime` shows the Realtime data tab.
- `monitoring-refresh` refreshes monitoring data from the header control.

## How to get to it (user POV)

- Choose `Request Monitor` in the sidebar.
- Open `#/demo/monitoring`.
- Follow documentation links to the Monitoring demo.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy.
- `doctor` is green.

- **Nav entry.** Choose `Request Monitor`. Run `control-cpamp click --role link --name 'Request Monitor'`. The page shows account overview metrics such as `Total Calls`.
- **Hash entry.** Open `#/demo/monitoring`. Run `control-cpamp goto --hash '#/demo/monitoring'`. Prefer the nav click path when proving the user entry. After the route settles, `Accounts`, `Client Keys`, and `Realtime` controls are visible.
- **Accounts tab.** Choose `Accounts`. Run `control-cpamp click --role tab --name 'Accounts'`. Account overview content remains visible.
- **Client Keys tab.** Choose `Client Keys`. Run `control-cpamp click --role tab --name 'Client Keys'`. Client key analytics content appears.
- **Realtime tab.** Choose `Realtime`. Run `control-cpamp click --role tab --name 'Realtime'`. Realtime request content appears.
- **Refresh.** Choose `Refresh All`. Run `control-cpamp click --role button --name 'Refresh All'`. The active monitoring tab stays mounted.
- **Proof.** Capture Realtime or Accounts. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/monitoring.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/monitoring.png`.

## Gotchas

- Live panels without request monitoring redirect to Config Panel. Demo mode keeps the route available.
- Tab accessible names may include badges, such as `Realtime 367`. Match with a non-exact name of `Realtime`, `Accounts`, or `Client Keys`.
- Hash-only assignment can update the breadcrumb without remounting demo routes. `control-cpamp goto` prefers matching `a[href]` clicks and reloads when it must set the hash directly.
- Visible page copy uses monitoring metrics such as `Total Calls`. Do not wait for the string `Request Monitoring` alone.
- Tab labels shorten on narrow widths. Prefer the full English names above.
- Maintenance query `?maintenance=degraded` changes demo fixture health. Record that query when used.
