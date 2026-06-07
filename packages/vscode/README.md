# @pixel-dsl/vscode

VS Code / Cursor extension for [Pixel-DSL](https://github.com/msyavuz/pixel-dsl) `.pix` sprite files.

## Features

- Syntax highlighting, snippets, and document outline (palettes + sprites)
- Language server: diagnostics, hover, completion, format (esbuild bundle of `packages/lsp/src`)
- Live sprite preview panel
- Build to PNG commands
- Palette / hex color decorators in the editor

## Asset layout (publish)

The extension is packaged as a self-contained VSIX. At build time, `scripts/stage-assets.mjs` copies:

- language files from [`@pixel-dsl/lang`](../lang/) (grammar, config, snippets)
- branding PNGs from [`assets/branding/`](../../assets/branding/) (committed canonical output of `examples/logo.pix`)

into `staged/` inside this package (gitignored). VS Code `contributes` paths point at `staged/` so the published extension does not depend on sibling monorepo folders.

## Local development

From the monorepo root:

```bash
pnpm install
pnpm --filter @pixel-dsl/vscode... build
```

Open `packages/vscode` in VS Code / Cursor, press **F5** to launch an Extension Development Host.

In the new window, open any `examples/*.pix` file from the monorepo.

### Commands

| Command | Description |
|---------|-------------|
| `Pixel-DSL: Open Preview` | Live canvas preview |
| `Pixel-DSL: Build to PNG` | Compile active sprite |
| `Pixel-DSL: Build All Sprites` | One PNG per sprite |
| `Pixel-DSL: Select Sprite` | Pick sprite for preview/build |

## License

ISC
