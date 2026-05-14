import { PNG } from "pngjs";
import type { Cell, Program, SpriteDecl } from "./ast.js";
import type { Diagnostic } from "./errors.js";
import {
	parseHex,
	type ResolvedPalette,
	type Rgba,
	resolveProgramPalettes,
} from "./palette.js";

export interface RenderOpts {
	spriteName?: string;
	scale?: number;
}

export class RenderError extends Error {
	constructor(
		message: string,
		public diagnostic: Diagnostic,
	) {
		super(message);
		this.name = "RenderError";
	}
}

const TRANSPARENT: Rgba = { r: 0, g: 0, b: 0, a: 0 };

function findSprite(program: Program, name?: string): SpriteDecl {
	if (name) {
		const found = program.sprites.find((s) => s.name === name);
		if (!found) {
			throw new RenderError(`Sprite \`${name}\` not found.`, {
				code: "render.unknown_sprite",
				severity: "error",
				message: `Sprite \`${name}\` not found.`,
				loc: { line: 1, col: 1 },
				hint: `Available sprites: ${program.sprites.map((s) => s.name).join(", ") || "(none)"}.`,
			});
		}
		return found;
	}
	if (program.sprites.length === 0) {
		throw new RenderError("No sprites in program.", {
			code: "render.no_sprites",
			severity: "error",
			message: "No sprites declared.",
			loc: { line: 1, col: 1 },
		});
	}
	return program.sprites[0];
}

function pickPalette(
	sprite: SpriteDecl,
	palettes: Map<string, ResolvedPalette>,
): ResolvedPalette | undefined {
	if (sprite.palette) {
		const p = palettes.get(sprite.palette);
		if (!p) {
			throw new RenderError(`Unknown palette \`${sprite.palette}\`.`, {
				code: "render.unknown_palette",
				severity: "error",
				message: `Sprite \`${sprite.name}\` references unknown palette \`${sprite.palette}\`.`,
				loc: sprite.loc,
			});
		}
		return p;
	}
	// Fallback: if exactly one palette is declared, use it.
	return palettes.size === 1
		? palettes.values().next().value
		: palettes.values().next().value;
}

function resolveCell(
	cell: Cell,
	palette: ResolvedPalette | undefined,
	spriteName: string,
): Rgba {
	if (cell.type === "TransparentCell") return TRANSPARENT;
	if (cell.type === "HexValue") {
		const rgba = parseHex(cell.hex);
		if (!rgba) {
			throw new RenderError(`Invalid hex \`${cell.hex}\`.`, {
				code: "render.invalid_hex",
				severity: "error",
				message: `Invalid hex color \`${cell.hex}\`.`,
				loc: cell.loc,
			});
		}
		return rgba;
	}
	// PaletteRef
	if (!palette) {
		throw new RenderError(
			`Sprite \`${spriteName}\` references palette short \`${cell.name}\` but no palette is in scope.`,
			{
				code: "render.no_palette",
				severity: "error",
				message: `Sprite \`${spriteName}\` has no palette in scope for cell \`${cell.name}\`.`,
				loc: cell.loc,
				hint: "Add `palette=<name>` to the sprite declaration, or declare a single palette.",
			},
		);
	}
	const rgba = palette.entries.get(cell.name);
	if (!rgba) {
		throw new RenderError(
			`Palette \`${palette.name}\` has no entry for \`${cell.name}\`.`,
			{
				code: "render.unknown_palette_ref",
				severity: "error",
				message: `Palette \`${palette.name}\` has no entry for short \`${cell.name}\`.`,
				loc: cell.loc,
				hint: `Available shorts: ${[...palette.entries.keys()].join(", ") || "(none)"}.`,
			},
		);
	}
	return rgba;
}

function nearestNeighbor(
	src: Rgba[],
	width: number,
	height: number,
	scale: number,
): Rgba[] {
	if (scale === 1) return src;
	const dst: Rgba[] = new Array(width * scale * height * scale);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const px = src[y * width + x];
			for (let dy = 0; dy < scale; dy++) {
				for (let dx = 0; dx < scale; dx++) {
					const ox = x * scale + dx;
					const oy = y * scale + dy;
					dst[oy * width * scale + ox] = px;
				}
			}
		}
	}
	return dst;
}

export function render(program: Program, opts: RenderOpts = {}): Uint8Array {
	const scale = opts.scale ?? 1;
	if (!Number.isInteger(scale) || scale < 1) {
		throw new RenderError(`scale must be a positive integer, got ${scale}.`, {
			code: "render.bad_scale",
			severity: "error",
			message: `scale must be a positive integer, got ${scale}.`,
			loc: { line: 1, col: 1 },
		});
	}

	const { palettes, errors } = resolveProgramPalettes(program);
	if (errors.length > 0) {
		throw new RenderError(errors[0].message, errors[0]);
	}

	const sprite = findSprite(program, opts.spriteName);
	const palette = pickPalette(sprite, palettes);
	const expected = sprite.width * sprite.height;
	if (sprite.cells.length !== expected) {
		throw new RenderError(
			`Sprite \`${sprite.name}\` declares ${sprite.width}x${sprite.height} (${expected} cells) but has ${sprite.cells.length}.`,
			{
				code: "render.cell_count_mismatch",
				severity: "error",
				message: `Sprite \`${sprite.name}\` declares ${expected} cells but has ${sprite.cells.length}.`,
				loc: sprite.loc,
			},
		);
	}

	const pixels = sprite.cells.map((c) => resolveCell(c, palette, sprite.name));
	const scaled = nearestNeighbor(pixels, sprite.width, sprite.height, scale);

	const outW = sprite.width * scale;
	const outH = sprite.height * scale;
	const png = new PNG({ width: outW, height: outH });
	for (let i = 0; i < scaled.length; i++) {
		const { r, g, b, a } = scaled[i];
		png.data[i * 4 + 0] = r;
		png.data[i * 4 + 1] = g;
		png.data[i * 4 + 2] = b;
		png.data[i * 4 + 3] = a;
	}
	return new Uint8Array(PNG.sync.write(png));
}
