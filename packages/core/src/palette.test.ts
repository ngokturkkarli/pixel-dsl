import { describe, expect, it } from "vitest";
import { parse } from "./index.js";
import { parseHex, resolveProgramPalettes } from "./palette.js";

function programOf(source: string) {
	const { ast, errors } = parse(source);
	expect(errors).toEqual([]);
	if (!ast) throw new Error("expected non-null ast");
	return ast;
}

describe("parseHex", () => {
	it("parses #rrggbb", () => {
		expect(parseHex("#ff8000")).toEqual({ r: 255, g: 128, b: 0, a: 255 });
	});

	it("expands #rgb to #rrggbb", () => {
		expect(parseHex("#f80")).toEqual({ r: 255, g: 136, b: 0, a: 255 });
	});

	it("expands #rgba to #rrggbbaa", () => {
		expect(parseHex("#f80c")).toEqual({ r: 255, g: 136, b: 0, a: 204 });
	});

	it("parses #rrggbbaa", () => {
		expect(parseHex("#ff8000cc")).toEqual({ r: 255, g: 128, b: 0, a: 204 });
	});

	it("rejects #abcde (length 5)", () => {
		expect(parseHex("#abcde")).toBeNull();
	});

	it("rejects #abcdefg (length 7)", () => {
		expect(parseHex("#abcdefg")).toBeNull();
	});
});

describe("resolveProgramPalettes", () => {
	it("resolves a clean palette", () => {
		const ast = programOf("palette nes { black k #000000 white w #ffffff }");
		const { palettes, errors } = resolveProgramPalettes(ast);
		expect(errors).toEqual([]);
		const nes = palettes.get("nes");
		expect(nes?.entries.get("k")).toEqual({ r: 0, g: 0, b: 0, a: 255 });
		expect(nes?.entries.get("w")).toEqual({ r: 255, g: 255, b: 255, a: 255 });
	});

	it("reports a duplicate short name", () => {
		const ast = programOf("palette nes { black k #000 white k #fff }");
		const { errors } = resolveProgramPalettes(ast);
		expect(errors).toHaveLength(1);
		expect(errors[0].code).toBe("palette.duplicate_short");
	});

	it("reports a duplicate long name", () => {
		const ast = programOf("palette nes { black k #000 black w #fff }");
		const { errors } = resolveProgramPalettes(ast);
		expect(errors).toHaveLength(1);
		expect(errors[0].code).toBe("palette.duplicate_long");
	});

	it("reports an invalid hex length (5 digits)", () => {
		const ast = programOf("palette nes { foo f #abcde }");
		const { errors } = resolveProgramPalettes(ast);
		expect(errors).toHaveLength(1);
		expect(errors[0].code).toBe("palette.invalid_hex");
	});

	it("reports a duplicate palette name", () => {
		const ast = programOf("palette nes { a a #000 } palette nes { b b #fff }");
		const { errors } = resolveProgramPalettes(ast);
		expect(errors.some((e) => e.code === "palette.duplicate_palette")).toBe(
			true,
		);
	});
});
