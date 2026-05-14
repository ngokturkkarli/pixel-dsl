import { describe, expect, it } from "vitest";
import { decodePNG, loadFixture } from "../test/helpers.js";
import { parse } from "./index.js";
import { RenderError, render } from "./render.js";

function programOf(source: string) {
	const { ast, errors } = parse(source);
	expect(errors).toEqual([]);
	if (!ast) throw new Error("expected non-null ast");
	return ast;
}

describe("render", () => {
	it("renders check-2x2 to match the golden PNG (pixel-compare)", () => {
		const ast = programOf(loadFixture("check-2x2.pix"));
		const actual = decodePNG(render(ast));
		const golden = decodePNG("golden/check-2x2.png");
		expect(actual.width).toBe(golden.width);
		expect(actual.height).toBe(golden.height);
		expect(actual.data).toEqual(golden.data);
	});

	it("renders hero-8x8 to match the golden PNG (pixel-compare)", () => {
		const ast = programOf(loadFixture("hero-8x8.pix"));
		const actual = decodePNG(render(ast));
		const golden = decodePNG("golden/hero-8x8.png");
		expect(actual.width).toBe(golden.width);
		expect(actual.height).toBe(golden.height);
		expect(actual.data).toEqual(golden.data);
	});

	it("upscales with nearest-neighbor at scale=4", () => {
		const ast = programOf(loadFixture("check-2x2.pix"));
		const actual = decodePNG(render(ast, { scale: 4 }));
		expect(actual.width).toBe(8);
		expect(actual.height).toBe(8);
		// Top-left 4x4 block should be solid black (k = #000000).
		for (let y = 0; y < 4; y++) {
			for (let x = 0; x < 4; x++) {
				const i = (y * 8 + x) * 4;
				expect([
					actual.data[i],
					actual.data[i + 1],
					actual.data[i + 2],
					actual.data[i + 3],
				]).toEqual([0, 0, 0, 255]);
			}
		}
	});

	it("throws RenderError with diagnostic for unknown sprite name", () => {
		const ast = programOf("palette p { a a #000 } sprite x 1x1 { a }");
		try {
			render(ast, { spriteName: "nope" });
			throw new Error("expected throw");
		} catch (e) {
			expect(e).toBeInstanceOf(RenderError);
			expect((e as RenderError).diagnostic.code).toBe("render.unknown_sprite");
		}
	});

	it("throws RenderError for cell count not matching dimensions", () => {
		// declare 2x2 but provide 3 cells via inline source (parser doesn't enforce)
		const ast = programOf("palette p { a a #000 } sprite bad 2x2 { a a a }");
		try {
			render(ast);
			throw new Error("expected throw");
		} catch (e) {
			expect(e).toBeInstanceOf(RenderError);
			expect((e as RenderError).diagnostic.code).toBe(
				"render.cell_count_mismatch",
			);
		}
	});

	it("throws RenderError for unknown palette short in a cell", () => {
		const ast = programOf("palette p { a a #000 } sprite x 1x1 { z }");
		try {
			render(ast);
			throw new Error("expected throw");
		} catch (e) {
			expect(e).toBeInstanceOf(RenderError);
			expect((e as RenderError).diagnostic.code).toBe(
				"render.unknown_palette_ref",
			);
		}
	});

	it("renders inline hex literals in cells", () => {
		const ast = programOf("sprite raw 1x1 { #ff0000 }");
		const actual = decodePNG(render(ast));
		expect(actual.width).toBe(1);
		expect(actual.height).toBe(1);
		expect([
			actual.data[0],
			actual.data[1],
			actual.data[2],
			actual.data[3],
		]).toEqual([255, 0, 0, 255]);
	});

	it("renders `.` as transparent", () => {
		const ast = programOf("sprite t 1x1 { . }");
		const actual = decodePNG(render(ast));
		expect(actual.data[3]).toBe(0);
	});
});
