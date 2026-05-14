import { describe, expect, it } from "vitest";
import { parserInstance } from "./parser.js";
import { PixelLexer } from "./tokens.js";

function parseProgram(source: string) {
	const lex = PixelLexer.tokenize(source);
	expect(lex.errors).toEqual([]);
	parserInstance.input = lex.tokens;
	const cst = parserInstance.program();
	return { cst, errors: parserInstance.errors };
}

describe("Parser", () => {
	it("parses a palette declaration", () => {
		const { cst, errors } = parseProgram("palette nes { black k #000000 }");
		expect(errors).toEqual([]);
		expect(cst.name).toBe("program");
		expect(cst.children.paletteDecl).toHaveLength(1);
		expect(cst.children.spriteDecl).toBeUndefined();
		expect(cst.children.invocation).toBeUndefined();
	});

	it("parses a sprite declaration with compact grid", () => {
		const { cst, errors } = parseProgram("sprite hero 2x2 { k k / k . }");
		expect(errors).toEqual([]);
		expect(cst.children.spriteDecl).toHaveLength(1);
	});

	it("parses a sprite with params and palette attribute", () => {
		const source = "sprite hero(skin=s, hair=h) 8x8 palette=nes { . }";
		const { errors } = parseProgram(source);
		expect(errors).toEqual([]);
	});

	it("parses an invocation with mixed ref and hex args", () => {
		const { cst, errors } = parseProgram("hero(skin=light, hair=#222)");
		expect(errors).toEqual([]);
		expect(cst.children.invocation).toHaveLength(1);
	});

	it("parses an empty program", () => {
		const { cst, errors } = parseProgram("");
		expect(errors).toEqual([]);
		expect(cst.children).toEqual({});
	});

	it("parses mixed top-level declarations and invocations", () => {
		const source = `
      palette nes { black k #000 }
      sprite hero 1x1 { k }
      hero(skin=#111)
    `;
		const { cst, errors } = parseProgram(source);
		expect(errors).toEqual([]);
		expect(cst.children.paletteDecl).toHaveLength(1);
		expect(cst.children.spriteDecl).toHaveLength(1);
		expect(cst.children.invocation).toHaveLength(1);
	});

	it("reports a parse error for a missing closing brace", () => {
		const { errors } = parseProgram("palette nes { black k #000000");
		expect(errors.length).toBeGreaterThan(0);
		// The EOF token has NaN positions; location recovery happens in index.parse().
		expect(errors[0].name).toBeTruthy();
	});

	it("reports a parse error for a missing `=` in a param", () => {
		const { errors } = parseProgram("hero(skin #222)");
		expect(errors.length).toBeGreaterThan(0);
	});
});
