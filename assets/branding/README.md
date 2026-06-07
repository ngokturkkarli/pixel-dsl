# Branding PNGs (canonical)

Deterministic PNG exports of [`examples/logo.pix`](../../examples/logo.pix).

This folder is the **single committed source** for logo, favicon, and file-icon assets
used across the monorepo and the VS Code extension publish bundle.

## Regenerate

From the repo root (requires `pixel-dsl` on PATH, or build CLI first):

```bash
pnpm render:assets
```

That script re-renders gallery sprites, writes PNGs here, then runs
[`scripts/sync-branding.sh`](../../scripts/sync-branding.sh) to copy into docs,
playground, and (on vscode build) the extension package.

When `examples/logo.pix` changes, re-run `pnpm render:assets` and commit this folder.
