# Login and setup

Login and setup let an operator connect the panel to CPA or complete Manager Server first-run setup with an admin key, CPA URL, CPA Management Key, and monitoring options.

## Sub-features

- `login-panel` opens the CPA Panel connect form at `#/login`.
- `login-manager-setup` walks Manager Server setup wizard steps when the panel is hosted by Manager Server and setup is incomplete.
- `login-submit` authenticates with the shown credential field and lands in the protected shell.
- `login-errors` shows validation and connection failure messages without entering the shell.

## How to get to it (user POV)

- Open `http://<host>/management.html#/login` on a non-demo panel build.
- Open a Manager Server first-run URL that presents the setup wizard.
- Choose `Logout` from a live authenticated session to return to login.

## Driving it with control-cpamp

Preconditions:

- A disposable Manager Server or CPA Panel endpoint is running.
- You have the matching Admin Key or CPA Management Key for that disposable instance.
- Demo launch alone is not enough. Without a live backend, mark this feature `verified-unreachable`.

- **Open login.** Navigate to the live panel login hash. Run `control-cpamp goto --url 'http://127.0.0.1:18317/management.html#/login'` against the disposable host. The form shows `Connect` or `Login` and a credential field.
- **CPA Panel connect.** Fill the management key and choose `Connect` or `Login`. Run `control-cpamp fill --name 'Management Key:' --value '<key>'` then `control-cpamp click --role button --name 'Connect'`. The protected shell appears.
- **Manager setup.** On first-run Manager Server, complete Admin Key, CPA Connection, CPA Management Key, monitoring, polling, and review steps using the labeled fields, then submit. The shell opens on Dashboard.
- **Validation miss.** Submit an empty required field. The page shows a required-field error and stays on login or setup.
- **Proof.** After a successful login, capture the shell. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/login.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/login.png`. Artifacts show the authenticated navigation shell, not the login form.

## Gotchas

- Demo mode bypasses login. `#/demo` never proves `#/login`.
- Manager Server uses `Admin Key`. CPA Panel uses `CPA Management Key` or `Management Key:`. Assert the label that the mode actually shows.
- Do not paste production keys into verification logs or artifacts.
