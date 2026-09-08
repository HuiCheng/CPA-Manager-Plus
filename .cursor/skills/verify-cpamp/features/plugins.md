# Plugins

Plugin management lets operators review installed plugins, open the plugin store, and reach plugin-provided resource pages when the server supports plugins.

## Sub-features

- `plugins-open` opens Plugin Management.
- `plugins-installed` shows the Installed tab.
- `plugins-store` shows the Plugin Store tab and the `/plugin-store` redirect.
- `plugins-resource` opens demo plugin resource pages such as Request Insights and Account Auditor.

## How to get to it (user POV)

- Choose `Plugins` in the sidebar.
- Open `#/demo/plugins`.
- Open `#/demo/plugins?tab=store`.
- Open `#/demo/plugin-store` and accept the redirect to `#/demo/plugins?tab=store`.
- Open `#/demo/plugin-pages/<pluginId>/<menuIndex>` when a plugin menu entry exists.
- Choose `Request Insights` or `Account Auditor` in the demo sidebar when those plugin menus are registered.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy.
- `doctor` is green.
- Demo mode exposes plugins even when a live CPA build would hide them.

- **Nav entry.** Choose `Plugins`. Run `control-cpamp click --role link --name 'Plugins'`. The page shows `Plugin Management`.
- **Installed tab.** Choose `Installed`. Run `control-cpamp click --role tab --name 'Installed'`. Installed plugin content is visible.
- **Store tab.** Choose `Plugin Store`. Run `control-cpamp click --role tab --name 'Plugin Store'`. Store content is visible.
- **Store redirect.** Open the legacy store hash. Run `control-cpamp goto --hash '#/demo/plugin-store'`. The end state is the store tab under plugins.
- **Resource pages.** Choose `Request Insights` or open `#/demo/plugin-pages/request-insights/0`. Run `control-cpamp click --role link --name 'Request Insights'` or `control-cpamp goto --hash '#/demo/plugin-pages/request-insights/0'`. Choose `Account Auditor` or open `#/demo/plugin-pages/account-auditor/0` the same way. Each resource page renders inside the shell.
- **Proof.** Capture Installed or Store. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/plugins.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/plugins.png`.

## Gotchas

- Live CPA builds without plugin support redirect `/plugins` to Dashboard.
- Install or uninstall on a live server mutates CPA plugins. Prefer read-only proof in shared environments.
