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
	});

	it("parses a sprite declaration with compact grid", () => {
		const { cst, errors } = parseProgram("sprite hero 2x2 { k k / k . }");
		expect(errors).toEqual([]);
		expect(cst.children.spriteDecl).toHaveLength(1);
	});

	it("parses a sprite with a palette attribute", () => {
		const source = "sprite hero 8x8 palette=nes { . }";
		const { errors } = parseProgram(source);
		expect(errors).toEqual([]);
	});

	it("parses a flip op in a sprite body", () => {
		const { errors } = parseProgram("sprite hero 4x4 { fill k flip h }");
		expect(errors).toEqual([]);
	});

	it("parses an empty program", () => {
		const { cst, errors } = parseProgram("");
		expect(errors).toEqual([]);
		expect(cst.children).toEqual({});
	});

	it("parses mixed top-level declarations", () => {
		const source = `
      palette nes { black k #000 }
      sprite hero 1x1 { k }
    `;
		const { cst, errors } = parseProgram(source);
		expect(errors).toEqual([]);
		expect(cst.children.paletteDecl).toHaveLength(1);
		expect(cst.children.spriteDecl).toHaveLength(1);
	});

	it("reports a parse error for a missing closing brace", () => {
		const { errors } = parseProgram("palette nes { black k #000000");
		expect(errors.length).toBeGreaterThan(0);
		// The EOF token has NaN positions; location recovery happens in index.parse().
		expect(errors[0].name).toBeTruthy();
	});

	it("reports a parse error for a sprite missing dimensions", () => {
		const { errors } = parseProgram("sprite hero { k }");
		expect(errors.length).toBeGreaterThan(0);
	});
});
