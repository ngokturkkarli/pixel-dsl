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

	describe("shape ops", () => {
		function pixelAt(data: Buffer, width: number, x: number, y: number) {
			const i = (y * width + x) * 4;
			return [data[i], data[i + 1], data[i + 2], data[i + 3]];
		}

		it("fills the entire sprite", () => {
			const ast = programOf("sprite x 2x2 { fill #ff0000 }");
			const png = decodePNG(render(ast));
			for (let i = 0; i < 4; i++) {
				expect(pixelAt(png.data, 2, i % 2, Math.floor(i / 2))).toEqual([
					255, 0, 0, 255,
				]);
			}
		});

		it("draws a rect inclusive of both corners", () => {
			const ast = programOf("sprite x 4x4 { fill . rect 1,1 2,2 #00ff00 }");
			const png = decodePNG(render(ast));
			expect(pixelAt(png.data, 4, 0, 0)).toEqual([0, 0, 0, 0]); // transparent outside
			expect(pixelAt(png.data, 4, 1, 1)).toEqual([0, 255, 0, 255]);
			expect(pixelAt(png.data, 4, 2, 2)).toEqual([0, 255, 0, 255]);
			expect(pixelAt(png.data, 4, 3, 3)).toEqual([0, 0, 0, 0]);
		});

		it("draws a single pixel with `pixel`", () => {
			const ast = programOf("sprite x 3x3 { fill . pixel 1,1 #0000ff }");
			const png = decodePNG(render(ast));
			expect(pixelAt(png.data, 3, 1, 1)).toEqual([0, 0, 255, 255]);
			expect(pixelAt(png.data, 3, 0, 0)).toEqual([0, 0, 0, 0]);
		});

		it("draws a diagonal line via Bresenham", () => {
			const ast = programOf("sprite x 4x4 { fill . line 0,0 3,3 #ffffff }");
			const png = decodePNG(render(ast));
			expect(pixelAt(png.data, 4, 0, 0)).toEqual([255, 255, 255, 255]);
			expect(pixelAt(png.data, 4, 1, 1)).toEqual([255, 255, 255, 255]);
			expect(pixelAt(png.data, 4, 2, 2)).toEqual([255, 255, 255, 255]);
			expect(pixelAt(png.data, 4, 3, 3)).toEqual([255, 255, 255, 255]);
			expect(pixelAt(png.data, 4, 0, 3)).toEqual([0, 0, 0, 0]);
		});

		it("draws a filled circle", () => {
			const ast = programOf("sprite x 7x7 { fill . circle 3,3 2 #ff8800 }");
			const png = decodePNG(render(ast));
			// center filled
			expect(pixelAt(png.data, 7, 3, 3)).toEqual([255, 136, 0, 255]);
			// edge of circle (radius 2 from center)
			expect(pixelAt(png.data, 7, 5, 3)).toEqual([255, 136, 0, 255]);
			expect(pixelAt(png.data, 7, 3, 5)).toEqual([255, 136, 0, 255]);
			// far corner — outside
			expect(pixelAt(png.data, 7, 0, 0)).toEqual([0, 0, 0, 0]);
		});

		it("ops paint in order — later ops overwrite earlier", () => {
			const ast = programOf("sprite x 2x2 { fill #ff0000 fill #00ff00 }");
			const png = decodePNG(render(ast));
			expect(pixelAt(png.data, 2, 0, 0)).toEqual([0, 255, 0, 255]);
		});

		it("clips ops outside sprite bounds silently", () => {
			const ast = programOf(
				"sprite x 2x2 { fill . pixel 10,10 #ff0000 rect 0,0 99,99 #00ff00 }",
			);
			const png = decodePNG(render(ast));
			// pixel 10,10 silently dropped (out of bounds)
			// rect 0..99 clips to the 2x2 sprite — fills everything green
			expect(pixelAt(png.data, 2, 0, 0)).toEqual([0, 255, 0, 255]);
			expect(pixelAt(png.data, 2, 1, 1)).toEqual([0, 255, 0, 255]);
		});

		it("throws RenderError when a sprite mixes cells and ops", () => {
			const ast = programOf("sprite x 2x2 { . . . . fill #ff0000 }");
			try {
				render(ast);
				throw new Error("expected throw");
			} catch (e) {
				expect((e as RenderError).diagnostic.code).toBe("render.mixed_body");
			}
		});

		it("mirrors the canvas left↔right with `flip h`", () => {
			const ast = programOf("sprite x 2x1 { fill . pixel 0,0 #ff0000 flip h }");
			const png = decodePNG(render(ast));
			// pixel painted at x=0 should now be at x=1
			expect(pixelAt(png.data, 2, 0, 0)).toEqual([0, 0, 0, 0]);
			expect(pixelAt(png.data, 2, 1, 0)).toEqual([255, 0, 0, 255]);
		});

		it("mirrors the canvas top↔bottom with `flip v`", () => {
			const ast = programOf("sprite x 1x2 { fill . pixel 0,0 #00ff00 flip v }");
			const png = decodePNG(render(ast));
			expect(pixelAt(png.data, 1, 0, 0)).toEqual([0, 0, 0, 0]);
			expect(pixelAt(png.data, 1, 0, 1)).toEqual([0, 255, 0, 255]);
		});

		it("throws RenderError for an invalid flip axis", () => {
			const ast = programOf("sprite x 2x2 { fill . flip z }");
			try {
				render(ast);
				throw new Error("expected throw");
			} catch (e) {
				expect((e as RenderError).diagnostic.code).toBe("render.bad_axis");
			}
		});
	});
});
