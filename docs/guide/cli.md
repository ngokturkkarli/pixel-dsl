# CLI usage

## Install

```bash
npm install -g @pixel-dsl/cli
# or run ad-hoc: npx @pixel-dsl/cli build ...
```

## Commands

```bash
pixel-dsl build <input.pix> -o <output.png> [options]
```

### Options

| Flag | Description | Default |
|---|---|---|
| `-o, --output <path>` | output PNG path (required) | — |
| `-s, --scale <n>` | nearest-neighbor upscale factor (positive integer) | `1` |
| `--sprite <name>` | sprite to render when the file declares multiple | first sprite |
| `-w, --watch` | rebuild whenever the input file changes (runs until interrupted) | off |

### Exit codes

| Code | Meaning |
|---|---|
| `0` | Success — PNG written |
| `1` | Compile/render error — diagnostic on stderr |
| `2` | Bad CLI flag |

### Examples

```bash
pixel-dsl build hero.pix -o hero.png --scale 16
pixel-dsl build sheet.pix --sprite enemy -o enemy.png --scale 4
pixel-dsl build hero.pix -o hero.png --scale 16 --watch
```

### Diagnostic format

```
<file>:<line>:<col>: <severity>[<code>]: <message>
  hint: <optional hint>
```

This format is stable — safe to parse from scripts.
