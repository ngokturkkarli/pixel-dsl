/**
 * @file Tree-sitter grammar for Pixel-DSL
 * @license ISC
 *
 * Mirrors the canonical chevrotain grammar in @pixel-dsl/core. Keep the two in
 * sync: top-level palette/sprite declarations, cell-grid or shape-op bodies,
 * and the `flip h|v` transform op.
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
	name: "pixel_dsl",

	word: ($) => $.identifier,

	extras: ($) => [/\s/, $.comment],

	rules: {
		source_file: ($) => repeat($._definition),

		_definition: ($) => choice($.palette_decl, $.sprite_decl),

		palette_decl: ($) =>
			seq(
				"palette",
				field("name", $.identifier),
				"{",
				repeat($.palette_entry),
				"}",
			),

		palette_entry: ($) =>
			seq(
				field("long", $.identifier),
				field("short", $.identifier),
				field("color", $.hex_color),
			),

		sprite_decl: ($) =>
			seq(
				"sprite",
				field("name", $.identifier),
				field("size", $.dimensions),
				optional($.palette_attr),
				"{",
				repeat($._body_item),
				"}",
			),

		palette_attr: ($) => seq("palette", "=", field("palette", $.identifier)),

		_body_item: ($) => choice($._op, $.cell, $.row_separator),

		row_separator: (_) => "/",

		cell: ($) => $._value,

		_op: ($) =>
			choice(
				$.fill_op,
				$.rect_op,
				$.pixel_op,
				$.line_op,
				$.circle_op,
				$.flip_op,
			),

		fill_op: ($) => seq("fill", field("value", $._value)),

		rect_op: ($) =>
			seq(
				"rect",
				field("from", $.coord),
				field("to", $.coord),
				field("value", $._value),
			),

		pixel_op: ($) => seq("pixel", field("at", $.coord), field("value", $._value)),

		line_op: ($) =>
			seq(
				"line",
				field("from", $.coord),
				field("to", $.coord),
				field("value", $._value),
			),

		circle_op: ($) =>
			seq(
				"circle",
				field("center", $.coord),
				field("radius", $.integer),
				field("value", $._value),
			),

		flip_op: ($) => seq("flip", field("axis", $.identifier)),

		coord: ($) => seq(field("x", $.integer), ",", field("y", $.integer)),

		_value: ($) => choice($.identifier, $.hex_color, $.transparent),

		transparent: (_) => ".",

		hex_color: (_) => /#[0-9a-fA-F]{3,8}/,

		dimensions: (_) => /\d+x\d+/,

		integer: (_) => /\d+/,

		identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,

		comment: (_) => token(seq("//", /[^\n]*/)),
	},
});
