# Shell chrome

Shell chrome covers the shared header and navigation controls that surround every authenticated or demo page.

## Sub-features

- `shell-nav` reaches primary sidebar destinations.
- `shell-refresh` triggers `Refresh All`.
- `shell-language` opens the language menu.
- `shell-theme` opens the theme menu.
- `shell-visual-effects` opens the visual effects menu.
- `shell-logout` exposes Logout.
- `shell-mobile-nav` toggles the mobile sidebar when the viewport is narrow.

## How to get to it (user POV)

- Use the sidebar navigation on any demo page.
- Use header buttons labeled `Refresh All`, `Language`, `Theme`, `Visual effects`, and `Logout`.
- On a narrow viewport, use the mobile navigation toggle.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy on any `#/demo` page.
- `doctor` is green.

- **Language menu.** Choose `Language`. Run `control-cpamp click --role button --name 'Language'`. Language options such as `English` appear.
- **Theme menu.** Choose `Theme`. Run `control-cpamp click --role button --name 'Theme'`. Theme options `Auto`, `Light`, and `Dark` appear.
- **Visual effects menu.** Choose `Visual effects`. Run `control-cpamp click --role button --name 'Visual effects'`. Options `Full effects` and `Performance` appear.
- **Refresh.** Choose `Refresh All`. Run `control-cpamp click --role button --name 'Refresh All'`. The current page remains mounted.
- **Logout presence.** Confirm `Logout` exists. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/shell.aria.txt`. The snapshot includes `Logout`.
- **Proof.** Capture the shell with a primary page visible. Run `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/shell.png`.

## Gotchas

- Choosing a non-English language changes accessible names for later steps. Switch back to `English` before recipes that assert English labels.
- Demo logout returns to the demo root rather than a live login form.
- Mobile nav labels depend on viewport width. Set a narrow window before asserting the mobile toggle.
