# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `@pixel-dsl/lang`: shared TextMate grammar, language configuration, and snippets.
- `@pixel-dsl/vscode`: VS Code / Cursor extension with LSP, live preview, build commands,
  color decorators, and document formatting (comment-preserving).
- `@pixel-dsl/core`: `compilePreview`, `compilePng`, `formatSource`, and `formatDiagnosticLine`
  shared APIs; browser `pngjs` stub export.
- `@pixel-dsl/lsp`: document formatting via `formatSource`.

## [0.1.0] - 2026-06-06

First public release. Pre-1.0: the API may still change before 1.0.0.

### Added

- `@pixel-dsl/core`: parser and deterministic PNG renderer.
  - Palette declarations with `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa` hex colors.
  - Sprite bodies as either a cell grid or a sequence of shape ops.
  - Shape ops: `fill`, `rect`, `pixel`, `line` (Bresenham), `circle` (filled disc).
  - `flip h` / `flip v` transform ops — mirror the accumulated canvas.
  - Nearest-neighbor integer upscaling and structured `Diagnostic` errors.
- `@pixel-dsl/cli`: `pixel-dsl build` command with `--scale`, `--sprite`, and `--watch`.
- Documentation site with `pix` syntax highlighting and an interactive playground
  (live preview, share links, PNG export).

### Removed

- Sprite parameters and invocation syntax. These parsed but were never rendered;
  the no-op surface was removed rather than shipped. They may return as a real
  feature in a future release.
