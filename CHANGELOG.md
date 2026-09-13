# Changelog

## 0.1.0-beta.2 — 2026-09-13

- Resolve the packaged test node path before starting Node-RED, supporting Linux CI as well as Windows.
- First downloadable prerelease; beta.1 remains an initial development tag.

## 0.1.0-beta.1 — 2026-09-13

- Initial read-only Dashboard 2 widget with 1/8/16/32 LEDs.
- Explicit boolean, UInt8, UInt16, UInt32, boolean array and named-object inputs.
- Visual per-indicator editor, source mapping, inherited inversion, enabled state, colors and optional MDI icons.
- Compact transport, unsigned bit 31, last-valid retention and bounded validation warnings.
- Frame coalescing, changed-indicator rendering, optional diagnostics and theme-aware responsive layout.
- Unit/runtime tests, real Dashboard browser tests, examples and packaging workflow.
- Package name uses `node-red-dashboard-2-bit-led` for Dashboard's discovery mechanism.
- Raspberry Pi/MDC performance comparison remains an acceptance step before a stable release.
