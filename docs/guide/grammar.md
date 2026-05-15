# Grammar reference

This page is the entire surface of Pixel-DSL. It is intentionally small so it can fit in an LLM system prompt.

## Top-level program

A program is a sequence of palette declarations, sprite declarations, and sprite invocations. They can appear in any order.

## Palette declaration

```pix
palette NAME {
  LONG SHORT #HEX
  LONG SHORT #HEX
  ...
}
```

- `NAME`: identifier
- `LONG`: human-readable name (e.g. `black`)
- `SHORT`: one-or-more-character identifier used in cells (e.g. `k`)
- `#HEX`: `#rgb`, `#rgba`, `#rrggbb`, or `#rrggbbaa`

Duplicate `SHORT` or `LONG` within a palette is an error; so is an invalid hex length (5 or 7 digits).

## Sprite declaration

```pix
sprite NAME [(PARAMS)] WxH [palette=PNAME] {
  <body>
}
```

`PARAMS` (optional): comma-separated `name=default` pairs, where each `default` is a palette short or a `#hex`. (Param substitution is reserved for future work; current renderer ignores params.)

`WxH`: integer width × height, e.g. `8x8`, `64x40`.

`palette=PNAME` (optional): bind a palette by name for the body. Defaults to the first declared palette.

The body is **either** a cell grid **or** a sequence of shape ops — never both.

### Cell grid

Whitespace-separated cells. Total cell count must equal `W*H`. Each cell is:

| Token | Meaning |
|---|---|
| identifier (palette short) | Look up in the bound palette |
| `#hex` | Inline color literal |
| `.` | Fully transparent pixel |

Optional `/` between cells is treated as a row separator and ignored.

### Shape ops

Painted in order on a transparent base. Later ops overwrite earlier ones. Coordinates out of bounds are silently clipped.

```pix
fill V
rect X,Y X,Y V
pixel X,Y V
line X,Y X,Y V
circle CX,CY R V
```

Where `V` is the same value form as a cell (`identifier`, `#hex`, or `.`).

| Op | Effect |
|---|---|
| `fill V` | Set every pixel to V |
| `rect x0,y0 x1,y1 V` | Filled rectangle, inclusive of both corners |
| `pixel x,y V` | Set a single pixel |
| `line x0,y0 x1,y1 V` | Bresenham line, 1px thick |
| `circle cx,cy r V` | Filled disc of radius `r` |

## Comments

`// ...` to end of line.

## Diagnostics

Every error has `code`, `line:col`, `message`, and (often) `hint`. Designed to be parsed by an LLM and used to self-correct:

```
foo.pix:3:11: error[palette.invalid_hex]: Invalid hex color `#abcde`.
  hint: Hex colors must have exactly 3, 4, 6, or 8 hex digits.
```

## Full example

```pix
palette nes {
  black k #000000
  white w #ffffff
  red   r #ff3030
}

sprite flag 16x12 palette=nes {
  fill k
  circle 8,5 3 w
  pixel 7,5 k
  pixel 9,5 k
  rect 6,7 9,7 w
  line 4,9 11,11 w
  line 11,9 4,11 w
  rect 5,11 10,11 r
}
```
