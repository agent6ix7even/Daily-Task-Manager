---
name: Electron builds in this sandbox
description: How to successfully build Electron desktop installers from this Replit Linux sandbox.
---

Building Windows/macOS Electron installers cross-platform from this container hits two blockers:

1. **Wine is broken here.** `wine` (32-bit) fails with "Exec format error" (32-bit exec unsupported in this sandbox), and `wine64` hangs/times out on `wineboot --init` (no display, first-run prefix init stalls). electron-builder needs wine to run `rcedit`/NSIS-resources tooling on Linux.
2. **`dmg-license` is not installed** as a transitive dep of `dmg-builder`, so `mac.target: dmg` throws `Cannot find module 'dmg-license'` immediately.

**Why:** electron-builder's NSIS and DMG targets both shell out to Windows-native helper `.exe` tools (even without code signing), which requires a working wine on Linux hosts. This sandbox's wine packages don't work (see above).

**How to apply:** target formats that skip these helper tools:
- Windows: use `win.target: portable` only (not `nsis`), and set `win.signAndEditExecutable: false`. Produces a working single-file portable `.exe`, no wine needed.
- macOS: use `mac.target: zip` only (not `dmg`). Produces a `.zip` with the `.app` inside for both `x64` and `arm64`; unsigned but user can right-click → Open on first launch.
- Linux: `AppImage` target works fine without extra tooling.
- Avoid ESM-only npm packages (e.g. `electron-store` v10+, `"type": "module"`) in the Electron main process if the main process is compiled to CommonJS — causes `require` interop failures. Either compile main as ESM or avoid such packages (e.g. hand-roll a small JSON-file store with `node:fs`).
