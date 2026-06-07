import { describe, expect, it } from "vitest";
import { compilePng, compilePreview, formatDiagnosticLine } from "./preview.js";

const OK = "palette p { black k #000 } sprite s 2x2 palette=p { k k / k . }";

describe("compilePreview", () => {
	it("returns an image for valid source", () => {
		const r = compilePreview(OK, { scale: 2 });
		expect(r.diagnostics).toEqual([]);
		expect(r.image).not.toBeNull();
		expect(r.image?.width).toBe(4);
		expect(r.image?.height).toBe(4);
	});

	it("returns parse diagnostics without an image", () => {
		const r = compilePreview("palette p {");
		expect(r.image).toBeNull();
		expect(r.diagnostics.length).toBeGreaterThan(0);
		expect(r.diagnostics[0].code).toBe("parse.unexpected");
	});

	it("returns render diagnostics for unknown palette short", () => {
		const r = compilePreview(
			"palette p { black k #000 } sprite s 1x1 palette=p { z }",
		);
		expect(r.image).toBeNull();
		expect(
			r.diagnostics.some((d) => d.code === "render.unknown_palette_ref"),
		).toBe(true);
	});

	it("picks a named sprite", () => {
		const src =
			"palette p { black k #000 } sprite a 1x1 palette=p { k } sprite b 2x2 palette=p { k k / k . }";
		const r = compilePreview(src, { spriteName: "b", scale: 1 });
		expect(r.spriteName).toBe("b");
		expect(r.image?.width).toBe(2);
	});
});

describe("compilePng", () => {
	it("returns PNG bytes for valid source", () => {
		const r = compilePng("sprite s 1x1 { #ff0000 }");
		expect(r.diagnostics).toEqual([]);
		expect(r.bytes).toBeDefined();
		expect(r.bytes?.[0]).toBe(0x89); // PNG magic
	});
});

describe("formatDiagnosticLine", () => {
	it("includes hint when present", () => {
		const line = formatDiagnosticLine({
			code: "test",
			severity: "error",
			message: "msg",
			loc: { line: 1, col: 2 },
			hint: "hint",
		});
		expect(line).toContain("hint");
	});
});
