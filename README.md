# Dashboard 2 Bit LED

One Node-RED input displays 1, 8, 16 or 32 boolean signals in a FlowFuse Dashboard 2 widget. This is a read-only status display with no outputs, control commands or device-specific logic.

**Prerelease: 0.1.0-beta.2.** Target-device performance acceptance remains pending.

The GitHub repository is `oleru/node-red-contrib-dashboard2-bit-led`; the installable package is **`node-red-dashboard-2-bit-led`**. Dashboard 1.31 discovers third-party packages by the `node-red-dashboard-2-` name fragment, so the suggested repository name cannot also be the package name.

## Install

Requires Node.js **22.12+**, Node-RED **4+** and `@flowfuse/node-red-dashboard` **1.31.x**. Dashboard 1 is not supported. The package is not yet published to npm.

Download the `.tgz` from the GitHub prerelease, then run in your Node-RED user directory:

```sh
npm install @flowfuse/node-red-dashboard@1.31.0
npm install /path/to/node-red-dashboard-2-bit-led-0.1.0-beta.2.tgz
```

Restart Node-RED. Add **bit LEDs** from the dashboard palette, choose a Dashboard 2 group and explicitly select the input type. Import `examples/dashboard2-bit-led-flow.json` for examples of all input types. Inject nodes do not run automatically.

For installation from a versioned Git tag (requires the development build dependencies during installation):

```sh
npm install github:oleru/node-red-contrib-dashboard2-bit-led#v0.1.0-beta.2
```

The tarball includes the compiled browser bundle; no build is needed on the target machine. Keep the tarball available for reproducible installation or use the exact tag. Do not track a moving development branch.

## Input contract

Only `msg.payload` is transported. Values are never coerced or guessed.

| Selected type | Accepted payload | Mapping |
| --- | --- | --- |
| Boolean | `true` or `false` | Exactly one LED |
| UInt8 | Integer 0–255 | Zero-based bits 0–7 |
| UInt16 | Integer 0–65535 | Zero-based bits 0–15 |
| UInt32 | Integer 0–4294967295 | Zero-based bits 0–31, unsigned |
| Boolean array | Exactly the configured count, every element boolean | Configurable zero-based array index |
| Named object | Each configured key must be an own boolean property | Literal keys; extra keys ignored |

Numeric strings, negative numbers, fractional numbers, null, missing keys and sparse arrays are invalid. For objects, `motor.ready` is a literal key, not a nested property path. All configured sources are validated, including disabled indicators. Duplicate source mappings are allowed. Integer LED count may be smaller than the input width but cannot exceed it. Structured arrays are not supported in this version.

Invalid input retains the latest valid value, sets red Node-RED status and logs at most one warning per five seconds per node, including alternating error types. A subsequent valid value clears the error status. The warning includes cumulative invalid input count. Invalid payloads are not sent to the browser or saved in Dashboard's store.

## Configuration

Each LED has a source, label, enabled flag, inherited/normal/inverted logic, optional active/inactive colors and optional Material Design icon (e.g. `mdi-alert`). Per-LED choices override shared defaults. Disabled means visible and dimmed, independent of the payload. Inversion happens before active/inactive color selection.

Shared settings include default inversion, active/inactive/disabled colors, one-column/grid/wrapping-row layout and grid column count. Blank colors use Dashboard theme CSS variables. CSS colors and `var(--your-variable)` are supported. Grid layout reduces to at most two columns on narrow screens. Waiting LEDs use the disabled color and have an accessible “Waiting for data” label until the first valid input. State is exposed in accessible text as well as color.

Changing input type resets source mappings while retaining labels and visual overrides. Configuration is static until redeploy; `msg.ui_update`, client targeting and interactive actions are intentionally unsupported.

## Architecture and diagnostics

The server validates input once, saves one compact `{ payload }` in Dashboard's data store and sends one widget update. It does not split bits into messages. The browser decodes, inverts and selects colors. One `requestAnimationFrame` can be pending; the latest valid payload wins. LED elements remain mounted and only changed states have their style/accessible state updated. There are no polling timers or animations.

Dashboard's standard data tracker restores the last valid value after browser refresh, page remount and connection recovery. The store is in memory: a Node-RED restart requires the upstream source to resend its value.

Optional diagnostics display browser session totals for received updates, render frames, changed LEDs, coalesced values and client-side invalid values, plus average messages/second and renders/second. Runtime-rejected values never reach this counter; see Node-RED status/warnings for those. Diagnostics do not add a timer. With diagnostics disabled, counters and rate calculations are skipped.

## Development

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run benchmark
npm pack
```

Browser tests start a separate Node-RED runtime bound to `127.0.0.1:18890` and store its files under ignored `.test-runtime/`. They do not use your installed Node-RED settings or flows. Port 18890 must be free. Test HTTP input routes exist only in the test server and are not shipped. `npm pack` runs unit tests and builds the widget. Build output lives in `resources/` and is included in the tarball, not in Git.

See [validation notes](docs/VALIDATION.md) for tested scope and the remaining Raspberry Pi acceptance procedure. CI tests Linux on Node.js 22 and 24 and creates a tarball artifact. Tagged prereleases can attach that exact tarball.

## Integration and rollback

First test a pinned tarball on the intended test device. Back up its flows and package/lock files. Add this widget in parallel on Dashboard 2 while retaining the existing display and control flows. Compare values and measure CPU, memory and traffic before replacing old status widgets. Rollback restores the backed-up flows/packages and restarts Node-RED. No production or MDC installation is performed by this repository's build/test commands.

## References

- [FlowFuse third-party widget documentation](https://dashboard.flowfuse.com/contributing/widgets/third-party.html)
- [FlowFuse example widget](https://github.com/FlowFuse/node-red-dashboard-2-ui-example)

MIT licensed.
