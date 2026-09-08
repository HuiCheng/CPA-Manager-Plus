# OAuth login

OAuth login starts provider OAuth flows for Codex, Anthropic, Antigravity, Kimi, xAI, and plugin-provided OAuth entries.

## Sub-features

- `oauth-open` opens the standalone OAuth Login page.
- `oauth-provider-cards` shows built-in provider cards and start buttons.
- `oauth-start-readiness` proves a start control is present without completing an external browser login unless a disposable provider is configured.

## How to get to it (user POV)

- Choose `OAuth Login` in the sidebar.
- Open `#/demo/oauth`.
- Open provider-deep links such as `#/demo/oauth?provider=demo` when offered by fixtures.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy.
- `doctor` is green.

- **Nav entry.** Choose `OAuth Login`. Run `control-cpamp click --role link --name 'OAuth Login'`. OAuth provider cards are visible.
- **Hash entry.** Open `#/demo/oauth`. Run `control-cpamp goto --hash '#/demo/oauth'`. The same page remains visible.
- **Provider presence.** Wait for a built-in provider title such as `Codex OAuth`. Run `control-cpamp wait --text 'Codex OAuth'`. Start controls such as `Start Codex Login` are present.
- **Proof.** Capture the provider list. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/oauth.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/oauth.png`.

## Gotchas

- Completing a real OAuth handshake needs an external identity provider and writes auth files. Stop at start-control readiness unless the environment is disposable and intended for that flow.
- Accounts also has an OAuth Configuration view. This file covers the standalone `#/oauth` page only.
