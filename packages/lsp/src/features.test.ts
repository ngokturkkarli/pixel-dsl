import { describe, expect, it } from "vitest";
import { CompletionItemKind, DiagnosticSeverity } from "vscode-languageserver";
import {
	computeCompletions,
	computeDiagnostics,
	computeHover,
} from "./features.js";

describe("computeDiagnostics", () => {
	it("returns no diagnostics for valid source", () => {
		const text = "palette p { black k #000 } sprite s 1x1 palette=p { k }";
		expect(computeDiagnostics(text)).toEqual([]);
	});

	it("reports a parse error with a range", () => {
		const diags = computeDiagnostics("palette p {");
		expect(diags.length).toBeGreaterThan(0);
		expect(diags[0].code).toBe("parse.unexpected");
		expect(diags[0].severity).toBe(DiagnosticSeverity.Error);
		expect(diags[0].range.start.line).toBe(0);
	});

	it("reports a semantic error for an unknown palette short (via render)", () => {
		const text = "palette p { black k #000 } sprite s 1x1 palette=p { z }";
		const diags = computeDiagnostics(text);
		expect(diags.some((d) => d.code === "render.unknown_palette_ref")).toBe(
			true,
		);
	});

	it("reports a bad flip axis", () => {
		const diags = computeDiagnostics("sprite s 2x2 { fill . flip z }");
		expect(diags.some((d) => d.code === "render.bad_axis")).toBe(true);
	});
});

describe("computeHover", () => {
	it("returns keyword docs when hovering an op keyword", () => {
		// `fill` starts at column 15 in this line.
		const text = "sprite x 2x2 { fill k }";
		const hover = computeHover(text, { line: 0, character: 16 });
		expect(hover).not.toBeNull();
		const value = (hover?.contents as { value: string }).value;
		expect(value).toContain("fill");
	});

	it("returns null over a non-keyword", () => {
		const text = "sprite x 2x2 { fill k }";
		// column 20 is the palette short `k`, not a keyword.
		expect(computeHover(text, { line: 0, character: 20 })).toBeNull();
	});
});

describe("computeCompletions", () => {
	it("offers op keywords including flip", () => {
		const items = computeCompletions("", { line: 0, character: 0 });
		const flip = items.find((i) => i.label === "flip");
		expect(flip).toBeDefined();
		expect(flip?.kind).toBe(CompletionItemKind.Keyword);
	});

	it("offers palette shorts declared in the document", () => {
		const text = "palette nes { black k #000  white w #fff }";
		const items = computeCompletions(text, { line: 0, character: 0 });
		const short = items.find(
			(i) => i.label === "w" && i.kind === CompletionItemKind.Color,
		);
		expect(short).toBeDefined();
		expect(short?.detail).toContain("white");
	});
});
