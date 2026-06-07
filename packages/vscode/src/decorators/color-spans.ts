import { parse, parseHex, resolveProgramPalettes } from "@pixel-dsl/core";

const OP_KEYWORDS = new Set([
	"palette",
	"sprite",
	"fill",
	"rect",
	"pixel",
	"line",
	"circle",
	"flip",
]);

export function rgbaCss(r: number, g: number, b: number, a: number): string {
	return a < 255
		? `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`
		: `rgb(${r}, ${g}, ${b})`;
}

export interface ColorSpan {
	start: number;
	end: number;
	css: string;
}

/** Find hex literals and palette short refs that should get color swatches. */
export function colorSpansFromText(text: string): ColorSpan[] {
	const spans: ColorSpan[] = [];

	const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
	for (const match of text.matchAll(hexRe)) {
		const start = match.index ?? 0;
		const hex = match[0];
		const rgba = parseHex(hex);
		if (!rgba) continue;
		spans.push({
			start,
			end: start + hex.length,
			css: rgbaCss(rgba.r, rgba.g, rgba.b, rgba.a),
		});
	}

	const { ast } = parse(text);
	if (!ast) return spans;

	const { palettes } = resolveProgramPalettes(ast);
	const shortToColor = new Map<string, string>();
	for (const p of palettes.values()) {
		for (const [short, rgba] of p.entries) {
			shortToColor.set(short, rgbaCss(rgba.r, rgba.g, rgba.b, rgba.a));
		}
	}

	const idRe = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
	for (const match of text.matchAll(idRe)) {
		const word = match[0];
		if (OP_KEYWORDS.has(word)) continue;
		const color = shortToColor.get(word);
		if (!color) continue;
		const start = match.index ?? 0;
		spans.push({ start, end: start + word.length, css: color });
	}

	return spans;
}
