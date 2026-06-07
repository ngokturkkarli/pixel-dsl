#!/usr/bin/env bash
# Copy committed branding PNGs from assets/branding/ into consumer packages.
# Called by render-examples.sh after re-render, and by docs/playground prebuild.
set -euo pipefail

cd "$(dirname "$0")/.."
src="assets/branding"

for f in logo.png favicon.png file-icon.png; do
	if [[ ! -f "$src/$f" ]]; then
		echo "sync-branding: missing $src/$f — run pnpm render:assets" >&2
		exit 1
	fi
done

mkdir -p docs/public apps/playground/public
cp "$src/logo.png" docs/public/logo.png
cp "$src/favicon.png" docs/public/favicon.png
cp "$src/logo.png" apps/playground/public/logo.png

echo "sync-branding: assets/branding -> docs/public, apps/playground/public"
