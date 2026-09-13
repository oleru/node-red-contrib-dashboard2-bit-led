# Validation and acceptance

## Development environment

2026-09-13: Windows, Node.js 24.13.0, Node-RED 4.1.15, FlowFuse Dashboard 1.31.0, Vue 3.5.42 and Playwright Chromium. This environment is not the MDC Raspberry Pi.

Automated unit/runtime coverage includes unsigned boundaries and highest bits; invalid null/negative/fractional/non-finite/string inputs; exact array lengths and sparse arrays; own object keys and ignored extras; inversion, disabled states and color inheritance; one pending frame, latest-value coalescing, unchanged LED suppression and cancellation on unmount; compact transport and retained valid state. A simulated minute of invalid input at 10 Hz produces 12 warnings, not 600.

Real Dashboard browser tests cover every input type and all LED counts, bit 31, invalid-input retention across refresh, page navigation, 375px layout, 100 all-bit transitions paced at approximately 10 Hz, and connection recovery. Additional checks exercise the visual editor, individual overrides, CSS theme variables and retained DOM identity.

The CPU microbenchmark runs 100,000 complete 32-bit validation/decoding iterations. On the development machine one run took 8.75 ms. This is only a pure-function smoke benchmark: it does not measure Dashboard, WebSocket, browser rendering or Raspberry Pi performance, and does not establish an advantage over the previous implementation.

The widget adds no production JavaScript dependencies beyond its Dashboard peer. The development dependency tree includes upstream Node-RED/Dashboard tooling and reports npm audit findings; these are not automatically rewritten by this package. Deployments should evaluate and maintain their own Node-RED/Dashboard dependency versions.

## Required target-device acceptance before stable 0.1.0

1. Record test-device model, OS, Node.js, Node-RED, Dashboard and browser versions. Ensure the documented Node.js baseline is supported.
2. Back up flows, package.json and lockfile. Install the exact prerelease tarball on the test device only.
3. Preserve the existing Dashboard 1 view. Feed both old and new status displays with the same synthetic or observed values; do not connect the new node to control logic.
4. Exercise uint32 all-bits toggling and a rotating single bit at 10 Hz for at least 30 minutes each. Check bit 31, disabled and inverted indicators.
5. Record idle and load CPU, RSS/heap trend and browser memory/responsiveness, with the same sampling interval for the old and new displays. Record WebSocket frame count and bytes with browser network tooling. Do not equate pure decoding throughput with system performance.
6. Confirm one compact update per input, no growing render queue, matching final values, no progressive latency and stable long-run memory. Record measurement methodology and the actual results.
7. Send invalid input at 10 Hz; verify last-valid display, red status and at most one warning per five seconds. Restore valid input and check recovery.
8. Refresh, disconnect/reconnect, switch pages and change the actual Dashboard theme. Check target desktop/tablet/mobile widths and optional icons.
9. Restart Node-RED and verify that upstream data resends the current value. Runtime cache is not durable storage.
10. Promote a stable version only after recording results and resolving failures. Roll back by restoring saved flows/packages and restarting Node-RED.

No device installation, MDC flow changes, long-duration hardware test or baseline CPU/memory comparison was performed during initial package development.
