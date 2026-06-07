import { describe, expect, it } from "vitest";
import { colorSpansFromText, rgbaCss } from "./color-spans.js";

describe("rgbaCss", () => {
	it("formats opaque and transparent colors", () => {
		expect(rgbaCss(255, 0, 0, 255)).toBe("rgb(255, 0, 0)");
		expect(rgbaCss(255, 0, 0, 128)).toBe("rgba(255, 0, 0, 0.50)");
	});
});

describe("colorSpansFromText", () => {
	it("finds hex literals", () => {
		const spans = colorSpansFromText("palette p { red r #ff0000 }");
		expect(spans.some((s) => s.css === "rgb(255, 0, 0)")).toBe(true);
	});

	it("finds palette short refs but not keywords", () => {
		const text = "palette p { black k #000 } sprite s 1x1 palette=p { fill k }";
		const shorts = colorSpansFromText(text).filter(
			(s) => s.end - s.start === 1,
		);
		expect(shorts.map((s) => text.slice(s.start, s.end))).toContain("k");
		expect(shorts.map((s) => text.slice(s.start, s.end))).not.toContain("fill");
	});
});
