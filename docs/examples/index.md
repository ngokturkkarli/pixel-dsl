# Examples

Source files for these examples live under [`examples/`](https://github.com/msyavuz/pixel-dsl/tree/main/examples) in the repository.

| Example | Approach | Size |
|---|---|---|
| `check-2x2.pix` | Cell grid | 2×2 |
| `hero-8x8.pix` | Cell grid | 8×8 |
| `flag-ops.pix` | Shape ops | 16×12 |
| `pirate-ship-ops.pix` | Shape ops | 96×80 |
| `island-terrain.pix` | Cell grid (procedurally generated) | 128×128 |

## Cell grid vs ops

The same Jolly Roger flag, two ways:

### Cell grid (192 tokens)

```pix
sprite flag 16x12 palette=p {
  k k k k k k k k k k k k k k k k
  k k k k k k k k k k k k k k k k
  k k k k k w w w w w w k k k k k
  k k k k w w w w w w w w k k k k
  k k k k w w k w w k w w k k k k
  ... etc, 12 rows
}
```

### Ops (12 statements)

```pix
sprite flag 16x12 palette=p {
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

Same output. Ops are dramatically more concise and easier to write correctly.
