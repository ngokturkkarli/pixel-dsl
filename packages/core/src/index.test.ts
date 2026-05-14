import { describe, expect, it } from "vitest";
import { decodePNG, loadFixture } from "../test/helpers.js";
import { parse, render } from "./index.js";

describe("public API (parse + render)", () => {
	it("round-trips hero-8x8 source through parse and render to the golden PNG", () => {
		const { ast, errors } = parse(loadFixture("hero-8x8.pix"));
		expect(errors).toEqual([]);
		if (!ast) throw new Error("expected non-null ast");
		const actual = decodePNG(render(ast));
		const golden = decodePNG("golden/hero-8x8.png");
		expect(actual.data).toEqual(golden.data);
	});

	it("returns Diagnostic[] (not throws) on parse failure", () => {
		const { ast, errors } = parse("palette nes {");
		expect(ast).toBeNull();
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]).toMatchObject({
			code: expect.any(String),
			severity: "error",
			loc: { line: expect.any(Number), col: expect.any(Number) },
		});
	});
});
