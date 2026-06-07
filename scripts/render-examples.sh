#!/usr/bin/env bash
# Render every examples/*.pix sprite to a PNG for the docs gallery.
# Uses the workspace CLI (packages/cli). Output lands in docs/public/sprites/
# and is served at /sprites/<name>.png by VitePress.
#
# Scales are picked so each PNG is display-ready (~190-290px) and shown 1:1.
#
# Usage: pnpm render:assets  (run pnpm build first if CLI dist is missing)
set -euo pipefail

cd "$(dirname "$0")/.."
CLI="packages/cli/dist/index.js"
if [[ ! -f "$CLI" ]]; then
	echo "render-examples: $CLI not found — run: pnpm --filter @pixel-dsl/cli build" >&2
	exit 1
fi
pixel_dsl() { node "$CLI" "$@"; }
out="docs/public/sprites"
rm -rf "$out"
mkdir -p "$out"

# name:scale
renders=(
  "flag-ops:12"
  "heart:12"
  "coin:12"
  "potion:12"
  "mushroom:10"
  "tree:6"
  "cat:6"
  "spider:6"
  "pirate-skull:6"
  "kraken:3"
  "pirate-galleon:3"
)

for entry in "${renders[@]}"; do
  name="${entry%%:*}"
  scale="${entry##*:}"
  pixel_dsl build "examples/${name}.pix" -o "${out}/${name}.png" -s "${scale}"
  echo "rendered ${name} (scale ${scale}) -> ${out}/${name}.png"
done

# Branding — source: examples/logo.pix -> canonical assets/branding/ (Option A).
mkdir -p assets/branding
pixel_dsl build examples/logo.pix -o assets/branding/logo.png -s 16
pixel_dsl build examples/logo.pix -o assets/branding/favicon.png -s 2
pixel_dsl build examples/logo.pix -o assets/branding/file-icon.png -s 2
bash scripts/sync-branding.sh
echo "rendered logo -> assets/branding/ (commit this folder when logo.pix changes)"
