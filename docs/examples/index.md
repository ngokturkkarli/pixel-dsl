# Examples

Every sprite below is a `.pix` file in [`examples/`](https://github.com/msyavuz/pixel-dsl/tree/main/examples), compiled to PNG with the `pixel-dsl` CLI. Regenerate the whole gallery with [`scripts/render-examples.sh`](https://github.com/msyavuz/pixel-dsl/blob/main/scripts/render-examples.sh).

<div style="display:flex;flex-wrap:wrap;gap:1.75rem;align-items:flex-end;margin:2rem 0;">
  <figure style="margin:0;text-align:center;">
    <img src="/sprites/heart.png" alt="Heart" style="image-rendering:pixelated;" />
    <figcaption>heart · 16×16</figcaption>
  </figure>
  <figure style="margin:0;text-align:center;">
    <img src="/sprites/coin.png" alt="Gold coin" style="image-rendering:pixelated;" />
    <figcaption>coin · 16×16</figcaption>
  </figure>
  <figure style="margin:0;text-align:center;">
    <img src="/sprites/potion.png" alt="Potion flask" style="image-rendering:pixelated;" />
    <figcaption>potion · 16×16</figcaption>
  </figure>
  <figure style="margin:0;text-align:center;">
    <img src="/sprites/flag-ops.png" alt="Jolly Roger flag" style="image-rendering:pixelated;" />
    <figcaption>flag-ops · 16×12</figcaption>
  </figure>
  <figure style="margin:0;text-align:center;">
    <img src="/sprites/mushroom.png" alt="Toadstool" style="image-rendering:pixelated;" />
    <figcaption>mushroom · 20×20</figcaption>
  </figure>
  <figure style="margin:0;text-align:center;">
    <img src="/sprites/tree.png" alt="Tree" style="image-rendering:pixelated;" />
    <figcaption>tree · 32×32</figcaption>
  </figure>
  <figure style="margin:0;text-align:center;">
    <img src="/sprites/cat.png" alt="Cat" style="image-rendering:pixelated;" />
    <figcaption>cat · 32×32</figcaption>
  </figure>
  <figure style="margin:0;text-align:center;">
    <img src="/sprites/spider.png" alt="Black widow spider" style="image-rendering:pixelated;" />
    <figcaption>spider · 32×32</figcaption>
  </figure>
  <figure style="margin:0;text-align:center;">
    <img src="/sprites/pirate-skull.png" alt="Skull" style="image-rendering:pixelated;" />
    <figcaption>pirate-skull · 32×32</figcaption>
  </figure>
  <figure style="margin:0;text-align:center;">
    <img src="/sprites/kraken.png" alt="Kraken" style="image-rendering:pixelated;" />
    <figcaption>kraken · 96×96</figcaption>
  </figure>
  <figure style="margin:0;text-align:center;">
    <img src="/sprites/pirate-galleon.png" alt="Pirate galleon" style="image-rendering:pixelated;" />
    <figcaption>pirate-galleon · 96×72</figcaption>
  </figure>
</div>

## Source files

All of these are written as **shape ops** — `fill`, `rect`, `line`, `circle`, `pixel` (and `flip`).

| Example | Subject | Size |
|---|---|---|
| [`heart.pix`](https://github.com/msyavuz/pixel-dsl/blob/main/examples/heart.pix) | Heart | 16×16 |
| [`coin.pix`](https://github.com/msyavuz/pixel-dsl/blob/main/examples/coin.pix) | Gold coin | 16×16 |
| [`potion.pix`](https://github.com/msyavuz/pixel-dsl/blob/main/examples/potion.pix) | Potion flask | 16×16 |
| [`flag-ops.pix`](https://github.com/msyavuz/pixel-dsl/blob/main/examples/flag-ops.pix) | Jolly Roger flag | 16×12 |
| [`mushroom.pix`](https://github.com/msyavuz/pixel-dsl/blob/main/examples/mushroom.pix) | Toadstool | 20×20 |
| [`tree.pix`](https://github.com/msyavuz/pixel-dsl/blob/main/examples/tree.pix) | Tree | 32×32 |
| [`cat.pix`](https://github.com/msyavuz/pixel-dsl/blob/main/examples/cat.pix) | Cat | 32×32 |
| [`spider.pix`](https://github.com/msyavuz/pixel-dsl/blob/main/examples/spider.pix) | Black widow | 32×32 |
| [`pirate-skull.pix`](https://github.com/msyavuz/pixel-dsl/blob/main/examples/pirate-skull.pix) | Skull | 32×32 |
| [`kraken.pix`](https://github.com/msyavuz/pixel-dsl/blob/main/examples/kraken.pix) | Kraken | 96×96 |
| [`pirate-galleon.pix`](https://github.com/msyavuz/pixel-dsl/blob/main/examples/pirate-galleon.pix) | Pirate galleon | 96×72 |

## Cell grid vs ops

The same Jolly Roger flag, two ways:

### Cell grid (192 tokens)

```pix
sprite jolly 16x12 palette=flag {
  k k k k k k k k k k k k k k k k
  k k k k k k k k k k k k k k k k
  k k k k k w w w w w w k k k k k
  k k k k w w w w w w w w k k k k
  k k k k w w k w w k w w k k k k
  ... etc, 12 rows
}
```

### Ops (10 statements)

```pix
sprite jolly 16x12 palette=flag {
  fill k
  rect 1,1 14,10 k
  circle 8,5 3 w
  pixel 7,4 k
  pixel 9,4 k
  pixel 8,5 k
  rect 6,7 9,7 w
  line 4,9 11,11 w
  line 11,9 4,11 w
  rect 5,11 10,11 r
}
```

Same output. Ops are dramatically more concise and easier to write correctly.
