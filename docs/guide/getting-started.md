# Getting started

Pixel-DSL is a small text-based language for pixel-art sprites. A program declares **palettes** (named color tables) and **sprites** (named pictures of a given size). Sprites can be drawn either as a **cell grid** or as a sequence of **shape ops**.

## Install

Install the CLI globally to run `pixel-dsl` anywhere:

```bash
npm install -g @pixel-dsl/cli
# or: pnpm add -g @pixel-dsl/cli
# or: yarn global add @pixel-dsl/cli
```

Check it works:

```bash
pixel-dsl --version
```

Or run it without installing, via `npx`:

```bash
npx @pixel-dsl/cli build hero.pix -o hero.png --scale 16
```

### Use the renderer as a library

To compile sprites programmatically (in Node or the browser), install the core package instead:

```bash
npm install @pixel-dsl/core
```

```ts
import { parse, render } from "@pixel-dsl/core";

const { ast, errors } = parse(source);
if (ast && errors.length === 0) {
  const png = render(ast, { scale: 16 }); // Uint8Array of PNG bytes
}
```

### From source

For contributing or running the latest unreleased code:

```bash
git clone https://github.com/msyavuz/pixel-dsl
cd pixel-dsl
pnpm install
pnpm build
```

## Your first sprite

Save as `hero.pix`:

```pix
palette nes {
  black k #000000
  white w #ffffff
  red   r #ff3030
}

sprite hero 4x4 palette=nes {
  k k k k
  k w w k
  k w r k
  k k k k
}
```

Then:

```bash
pixel-dsl build hero.pix -o hero.png --scale 16
```

You should get a 64×64 PNG with a red dot on a white field, framed in black.

## Same sprite with ops

```pix
sprite hero 4x4 palette=nes {
  fill k
  rect 1,1 2,2 w
  pixel 2,2 r
}
```

Three ops vs sixteen cell tokens — and an LLM is much more likely to get the ops right than the grid.

## Next steps

- [Grammar reference](/guide/grammar)
- [Shape ops](/guide/shape-ops)
- [CLI usage](/guide/cli)
