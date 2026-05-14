import type { IToken } from "chevrotain";
import { describe, expect, it } from "vitest";
import { PixelLexer } from "./tokens.js";

function typesAndImages(source: string) {
	const result = PixelLexer.tokenize(source);
	expect(result.errors).toEqual([]);
	return result.tokens.map((t: IToken) => ({
		type: t.tokenType.name,
		image: t.image,
	}));
}

describe("Lexer", () => {
	it("tokenizes a palette block", () => {
		expect(typesAndImages("palette nes { black k #000000 }")).toEqual([
			{ type: "Palette", image: "palette" },
			{ type: "Identifier", image: "nes" },
			{ type: "LBrace", image: "{" },
			{ type: "Identifier", image: "black" },
			{ type: "Identifier", image: "k" },
			{ type: "HexColor", image: "#000000" },
			{ type: "RBrace", image: "}" },
		]);
	});

	it("tokenizes a compact sprite with Dimensions, Slash, and Dot", () => {
		expect(typesAndImages("sprite hero 2x2 { k k / k . }")).toEqual([
			{ type: "Sprite", image: "sprite" },
			{ type: "Identifier", image: "hero" },
			{ type: "Dimensions", image: "2x2" },
			{ type: "LBrace", image: "{" },
			{ type: "Identifier", image: "k" },
			{ type: "Identifier", image: "k" },
			{ type: "Slash", image: "/" },
			{ type: "Identifier", image: "k" },
			{ type: "Dot", image: "." },
			{ type: "RBrace", image: "}" },
		]);
	});

	it("tokenizes sprite params and hex overrides", () => {
		expect(typesAndImages("hero(skin=#fcc9b9, hair=#222)")).toEqual([
			{ type: "Identifier", image: "hero" },
			{ type: "LParen", image: "(" },
			{ type: "Identifier", image: "skin" },
			{ type: "Equals", image: "=" },
			{ type: "HexColor", image: "#fcc9b9" },
			{ type: "Comma", image: "," },
			{ type: "Identifier", image: "hair" },
			{ type: "Equals", image: "=" },
			{ type: "HexColor", image: "#222" },
			{ type: "RParen", image: ")" },
		]);
	});

	it("treats `palette` as keyword and `paletteFoo` as Identifier (longer_alt)", () => {
		expect(typesAndImages("palette paletteFoo")).toEqual([
			{ type: "Palette", image: "palette" },
			{ type: "Identifier", image: "paletteFoo" },
		]);
	});

	it("treats `sprite` as keyword and `spriteBar` as Identifier (longer_alt)", () => {
		expect(typesAndImages("sprite spriteBar")).toEqual([
			{ type: "Sprite", image: "sprite" },
			{ type: "Identifier", image: "spriteBar" },
		]);
	});

	it("skips // line comments", () => {
		expect(typesAndImages("// just a comment\npalette nes")).toEqual([
			{ type: "Palette", image: "palette" },
			{ type: "Identifier", image: "nes" },
		]);
	});

	it("accepts hex colors of length 3, 4, 6, and 8", () => {
		expect(typesAndImages("#abc #abcd #abcdef #abcdef12")).toEqual([
			{ type: "HexColor", image: "#abc" },
			{ type: "HexColor", image: "#abcd" },
			{ type: "HexColor", image: "#abcdef" },
			{ type: "HexColor", image: "#abcdef12" },
		]);
	});

	it("tracks line and column across newlines and comments", () => {
		const source = "palette nes {\n  // a comment\n  black k #000\n}";
		const result = PixelLexer.tokenize(source);
		expect(result.errors).toEqual([]);
		const positions = result.tokens.map((t: IToken) => ({
			type: t.tokenType.name,
			image: t.image,
			startLine: t.startLine,
			startColumn: t.startColumn,
		}));
		expect(positions).toEqual([
			{ type: "Palette", image: "palette", startLine: 1, startColumn: 1 },
			{ type: "Identifier", image: "nes", startLine: 1, startColumn: 9 },
			{ type: "LBrace", image: "{", startLine: 1, startColumn: 13 },
			{ type: "Identifier", image: "black", startLine: 3, startColumn: 3 },
			{ type: "Identifier", image: "k", startLine: 3, startColumn: 9 },
			{ type: "HexColor", image: "#000", startLine: 3, startColumn: 11 },
			{ type: "RBrace", image: "}", startLine: 4, startColumn: 1 },
		]);
	});

	it("reports a lexer error with line:col for an unknown character", () => {
		const result = PixelLexer.tokenize("palette & nes");
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]).toMatchObject({
			line: 1,
			column: 9,
		});
		expect(result.tokens.map((t: IToken) => t.tokenType.name)).toEqual([
			"Palette",
			"Identifier",
		]);
	});
});
