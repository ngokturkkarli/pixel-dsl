import { describe, expect, it } from "vitest";
import type { Program } from "./ast.js";
import { parse } from "./index.js";

function parseOk(source: string): Program {
	const { ast, errors } = parse(source);
	expect(errors).toEqual([]);
	if (!ast) throw new Error("expected non-null ast");
	return ast;
}

describe("Visitor (source → AST)", () => {
	it("builds a palette declaration", () => {
		const { ast, errors } = parse("palette nes { black k #000000 }");
		expect(errors).toEqual([]);
		expect(ast).toEqual({
			type: "Program",
			palettes: [
				{
					type: "PaletteDecl",
					name: "nes",
					entries: [
						{
							type: "PaletteEntry",
							long: "black",
							short: "k",
							hex: "#000000",
							loc: { line: 1, col: 15 },
						},
					],
					loc: { line: 1, col: 1 },
				},
			],
			sprites: [],
		});
	});

	it("builds a sprite with cells, filtering out `/` row separators", () => {
		const ast = parseOk("sprite hero 2x2 { k k / k . }");
		expect(ast.sprites).toHaveLength(1);
		const sprite = ast.sprites[0];
		expect(sprite.name).toBe("hero");
		expect(sprite.width).toBe(2);
		expect(sprite.height).toBe(2);
		expect(sprite.palette).toBeUndefined();
		expect(sprite.cells).toEqual([
			{ type: "PaletteRef", name: "k", loc: { line: 1, col: 19 } },
			{ type: "PaletteRef", name: "k", loc: { line: 1, col: 21 } },
			{ type: "PaletteRef", name: "k", loc: { line: 1, col: 25 } },
			{ type: "TransparentCell", loc: { line: 1, col: 27 } },
		]);
	});

	it("builds a sprite with a palette attribute", () => {
		const ast = parseOk("sprite hero 1x1 palette=nes { s }");
		const sprite = ast.sprites[0];
		expect(sprite.palette).toBe("nes");
	});

	it("builds a flip op", () => {
		const ast = parseOk("sprite hero 4x4 { fill k flip h }");
		const s = ast.sprites[0];
		expect(s.ops).toHaveLength(2);
		expect(s.ops[1]).toEqual({
			type: "FlipOp",
			axis: "h",
			loc: { line: 1, col: 26 },
		});
	});

	it("builds an empty Program for empty input", () => {
		const { ast, errors } = parse("");
		expect(errors).toEqual([]);
		expect(ast).toEqual({
			type: "Program",
			palettes: [],
			sprites: [],
		});
	});

	it("builds shape ops on a sprite body", () => {
		const ast = parseOk(
			"palette p { red r #f00 } sprite x 4x4 palette=p { fill . rect 0,0 3,3 r pixel 1,1 #ff0 line 0,0 3,3 r circle 2,2 1 r }",
		);
		const s = ast.sprites[0];
		expect(s.cells).toEqual([]);
		expect(s.ops).toHaveLength(5);
		expect(s.ops[0]).toMatchObject({ type: "FillOp" });
		expect(s.ops[1]).toMatchObject({
			type: "RectOp",
			x0: 0,
			y0: 0,
			x1: 3,
			y1: 3,
		});
		expect(s.ops[2]).toMatchObject({ type: "PixelOp", x: 1, y: 1 });
		expect(s.ops[3]).toMatchObject({
			type: "LineOp",
			x0: 0,
			y0: 0,
			x1: 3,
			y1: 3,
		});
		expect(s.ops[4]).toMatchObject({
			type: "CircleOp",
			cx: 2,
			cy: 2,
			r: 1,
		});
	});

	it("returns null ast and an error Diagnostic on parse failure", () => {
		const { ast, errors } = parse("palette nes { black k #000000");
		expect(ast).toBeNull();
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]).toMatchObject({
			code: "parse.unexpected",
			severity: "error",
			loc: { line: 1, col: expect.any(Number) },
		});
	});

	it("returns null ast and an error Diagnostic on lex failure", () => {
		const { ast, errors } = parse("palette &");
		expect(ast).toBeNull();
		expect(errors.some((e) => e.code === "lex.unknown_char")).toBe(true);
	});
});
