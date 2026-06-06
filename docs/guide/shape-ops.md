# Shape ops

For anything beyond a few cells, the cell grid gets unwieldy. Shape ops let you describe a sprite as composable shapes — much friendlier for humans *and* LLMs.

A sprite body is **either** a cell grid **or** a sequence of ops, not both. Ops paint in order onto a transparent base; later ops overwrite earlier ones. Out-of-bounds coordinates are silently clipped.

## `fill V`

Fill the whole sprite with one value.

```pix
sprite bg 16x16 { fill #2a6dba }
```

## `rect X,Y X,Y V`

Filled rectangle, inclusive of both corners.

```pix
sprite plank 32x4 {
  fill #7a4220
  rect 0,0 31,0 #4a2812   // shadow top edge
  rect 0,3 31,3 #4a2812   // shadow bottom edge
}
```

## `pixel X,Y V`

A single pixel — used for highlights, eyes, accents.

```pix
sprite eyes 16x4 {
  fill .
  pixel 4,1 #000
  pixel 11,1 #000
}
```

## `line X,Y X,Y V`

Bresenham line, 1 pixel thick. Works at any angle.

```pix
sprite cross 16x16 {
  fill .
  line 0,0 15,15 #fff
  line 15,0 0,15 #fff
}
```

## `circle CX,CY R V`

Filled disc.

```pix
sprite sun 32x32 {
  fill #87ceeb
  circle 16,16 8 #ffd700
}
```

## `flip h` / `flip v`

Mirror everything drawn so far. `flip h` mirrors left↔right, `flip v` mirrors top↔bottom. Because flips apply to the accumulated canvas, you can draw one half of a symmetric sprite, mirror it, then keep drawing.

```pix
sprite face 16x16 {
  fill .
  pixel 4,5 #000   // left eye
  rect 2,2 6,3 #444 // left brow
  flip h            // mirror the left half onto the right
  pixel 8,12 #b00   // mouth — drawn after the flip, stays centered
}
```

## Order matters

```pix
sprite layered 8x8 {
  fill #f00      // red base
  fill #0f0      // green wins
  circle 4,4 2 #00f  // blue dot on top
}
```

## Why ops over cells

For a 64×40 ship sprite:

- Cell grid: 2560 cell tokens, every one in the right column
- Ops: ~70 statements — `fill sky`, `rect hull`, `line mast`, etc.

LLMs are reliable at composing the latter. The cell grid form blows up on token alignment errors and there is no recovery.
