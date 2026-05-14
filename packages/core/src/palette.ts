import type { Location, PaletteDecl, Program } from "./ast.js";
import type { Diagnostic } from "./errors.js";

export interface Rgba {
	r: number;
	g: number;
	b: number;
	a: number;
}

export interface ResolvedPalette {
	name: string;
	entries: Map<string, Rgba>;
}

export function parseHex(hex: string): Rgba | null {
	if (!hex.startsWith("#")) return null;
	const body = hex.slice(1);
	if (![3, 4, 6, 8].includes(body.length)) return null;
	if (!/^[0-9a-fA-F]+$/.test(body)) return null;

	const expand = (s: string) =>
		s.length <= 4
			? s
					.split("")
					.map((c) => c + c)
					.join("")
			: s;
	const full = expand(body);
	const hasAlpha = full.length === 8;
	const r = Number.parseInt(full.slice(0, 2), 16);
	const g = Number.parseInt(full.slice(2, 4), 16);
	const b = Number.parseInt(full.slice(4, 6), 16);
	const a = hasAlpha ? Number.parseInt(full.slice(6, 8), 16) : 255;
	return { r, g, b, a };
}

function hexDiagnostic(hex: string, loc: Location): Diagnostic {
	return {
		code: "palette.invalid_hex",
		severity: "error",
		message: `Invalid hex color \`${hex}\`. Expected #rgb, #rgba, #rrggbb, or #rrggbbaa.`,
		loc,
		hint: "Hex colors must have exactly 3, 4, 6, or 8 hex digits.",
	};
}

export function resolvePalette(decl: PaletteDecl): {
	palette: ResolvedPalette;
	errors: Diagnostic[];
} {
	const entries = new Map<string, Rgba>();
	const seenShort = new Map<string, Location>();
	const seenLong = new Map<string, Location>();
	const errors: Diagnostic[] = [];

	for (const entry of decl.entries) {
		if (seenShort.has(entry.short)) {
			errors.push({
				code: "palette.duplicate_short",
				severity: "error",
				message: `Duplicate palette short name \`${entry.short}\` in palette \`${decl.name}\`.`,
				loc: entry.loc,
			});
			continue;
		}
		if (seenLong.has(entry.long)) {
			errors.push({
				code: "palette.duplicate_long",
				severity: "error",
				message: `Duplicate palette long name \`${entry.long}\` in palette \`${decl.name}\`.`,
				loc: entry.loc,
			});
			continue;
		}
		const rgba = parseHex(entry.hex);
		if (!rgba) {
			errors.push(hexDiagnostic(entry.hex, entry.loc));
			continue;
		}
		seenShort.set(entry.short, entry.loc);
		seenLong.set(entry.long, entry.loc);
		entries.set(entry.short, rgba);
	}

	return { palette: { name: decl.name, entries }, errors };
}

export function resolveProgramPalettes(program: Program): {
	palettes: Map<string, ResolvedPalette>;
	errors: Diagnostic[];
} {
	const palettes = new Map<string, ResolvedPalette>();
	const errors: Diagnostic[] = [];
	const seenNames = new Map<string, Location>();

	for (const decl of program.palettes) {
		if (seenNames.has(decl.name)) {
			errors.push({
				code: "palette.duplicate_palette",
				severity: "error",
				message: `Duplicate palette \`${decl.name}\`.`,
				loc: decl.loc,
			});
			continue;
		}
		seenNames.set(decl.name, decl.loc);
		const { palette, errors: palErrs } = resolvePalette(decl);
		errors.push(...palErrs);
		palettes.set(decl.name, palette);
	}

	return { palettes, errors };
}
