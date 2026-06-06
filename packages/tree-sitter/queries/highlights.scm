; Keywords
[
  "palette"
  "sprite"
  "fill"
  "rect"
  "pixel"
  "line"
  "circle"
  "flip"
] @keyword

"=" @operator
(row_separator) @punctuation.delimiter

; Declaration names
(palette_decl name: (identifier) @type)
(sprite_decl name: (identifier) @type)
(palette_attr palette: (identifier) @type)

; Palette entries: long name, short name
(palette_entry long: (identifier) @variable)
(palette_entry short: (identifier) @constant)

; Flip axis (h | v)
(flip_op axis: (identifier) @constant.builtin)

; Cells / op values that reference a palette short
(cell (identifier) @variable)
(fill_op value: (identifier) @variable)
(rect_op value: (identifier) @variable)
(pixel_op value: (identifier) @variable)
(line_op value: (identifier) @variable)
(circle_op value: (identifier) @variable)

; Literals
(hex_color) @string.special
(dimensions) @number
(integer) @number
(transparent) @constant.builtin

(comment) @comment
