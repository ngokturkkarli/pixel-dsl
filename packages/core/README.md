# @pixel-dsl/core

Parser and deterministic PNG renderer for [Pixel-DSL](https://github.com/msyavuz/pixel-dsl), an LLM-friendly pixel-art sprite language.

## Install

```bash
npm install @pixel-dsl/core
```

## Usage

```ts
import { parse, render, renderPixels } from "@pixel-dsl/core";

const source = `
palette nes { black k #000000  white w #ffffff }
sprite dot 8x8 palette=nes {
  fill k
  circle 4,4 2 w
  flip h
}
`;

const { ast, errors } = parse(source);
if (errors.length === 0 && ast) {
  const png = render(ast, { scale: 16 });        // Uint8Array of PNG bytes
  const { width, height, data } = renderPixels(ast); // raw RGBA, no PNG encode
}
```

## API

| Export | Description |
|---|---|
| `parse(source)` | Returns `{ ast, errors }`. Never throws; errors are `Diagnostic[]`. |
| `render(program, opts?)` | Renders to PNG bytes (`Uint8Array`). Throws `RenderError` with a `Diagnostic`. |
| `renderPixels(program, opts?)` | Renders to `{ width, height, data }` raw RGBA (skips PNG encoding). |
| `RenderError` | Thrown on render failures; carries a `.diagnostic`. |

`opts`: `{ scale?: number; spriteName?: string }`. `scale` is an integer ≥ 1 (nearest-neighbor upscale); `spriteName` selects which sprite to render when several are declared.

Diagnostics have a stable shape — `{ code, severity, message, loc: { line, col }, hint? }` — designed to be parsed and fed back to an LLM for self-correction.

## Language

See the [grammar reference](https://github.com/msyavuz/pixel-dsl/blob/main/docs/guide/grammar.md) for the full surface.

## License

ISC
