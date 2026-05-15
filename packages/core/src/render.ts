import { PNG } from "pngjs";
import type {
	Cell,
	Location,
	OpValue,
	Program,
	SpriteDecl,
	SpriteOp,
} from "./ast.js";
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

function resolveOpValue(
	v: OpValue,
	palette: ResolvedPalette | undefined,
	spriteName: string,
): Rgba {
	// OpValue is the same shape as Cell — reuse resolveCell.
	return resolveCell(v as Cell, palette, spriteName);
}

function applyOp(
	pixels: Rgba[],
	width: number,
	height: number,
	op: SpriteOp,
	color: Rgba,
	sprite: SpriteDecl,
) {
	const setPx = (x: number, y: number) => {
		if (x < 0 || y < 0 || x >= width || y >= height) return;
		pixels[y * width + x] = color;
	};
	switch (op.type) {
		case "FillOp":
			for (let i = 0; i < pixels.length; i++) pixels[i] = color;
			return;
		case "PixelOp":
			setPx(op.x, op.y);
			return;
		case "RectOp": {
			const xMin = Math.min(op.x0, op.x1);
			const xMax = Math.max(op.x0, op.x1);
			const yMin = Math.min(op.y0, op.y1);
			const yMax = Math.max(op.y0, op.y1);
			for (let y = yMin; y <= yMax; y++) {
				for (let x = xMin; x <= xMax; x++) setPx(x, y);
			}
			return;
		}
		case "LineOp": {
			// Bresenham's line algorithm
			let x0 = op.x0;
			let y0 = op.y0;
			const x1 = op.x1;
			const y1 = op.y1;
			const dx = Math.abs(x1 - x0);
			const dy = -Math.abs(y1 - y0);
			const sx = x0 < x1 ? 1 : -1;
			const sy = y0 < y1 ? 1 : -1;
			let err = dx + dy;
			while (true) {
				setPx(x0, y0);
				if (x0 === x1 && y0 === y1) break;
				const e2 = 2 * err;
				if (e2 >= dy) {
					err += dy;
					x0 += sx;
				}
				if (e2 <= dx) {
					err += dx;
					y0 += sy;
				}
			}
			return;
		}
		case "CircleOp": {
			if (op.r < 0) {
				throw new RenderError(
					`circle radius must be non-negative (got ${op.r}).`,
					opDiagnostic(
						"render.bad_radius",
						`Circle radius ${op.r} is negative.`,
						op.loc,
						sprite.name,
					),
				);
			}
			const r2 = op.r * op.r;
			for (let dy = -op.r; dy <= op.r; dy++) {
				for (let dx = -op.r; dx <= op.r; dx++) {
					if (dx * dx + dy * dy <= r2) setPx(op.cx + dx, op.cy + dy);
				}
			}
			return;
		}
	}
}

function opDiagnostic(
	code: string,
	message: string,
	loc: Location,
	spriteName: string,
): Diagnostic {
	return {
		code,
		severity: "error",
		message: `Sprite \`${spriteName}\`: ${message}`,
		loc,
	};
}

function renderOps(
	sprite: SpriteDecl,
	palette: ResolvedPalette | undefined,
): Rgba[] {
	const pixels: Rgba[] = new Array(sprite.width * sprite.height);
	for (let i = 0; i < pixels.length; i++) pixels[i] = TRANSPARENT;
	for (const op of sprite.ops) {
		const color = resolveOpValue(op.value, palette, sprite.name);
		applyOp(pixels, sprite.width, sprite.height, op, color, sprite);
	}
	return pixels;
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

export interface RenderedImage {
	width: number;
	height: number;
	data: Uint8Array; // RGBA, row-major
}

export function renderPixels(
	program: Program,
	opts: RenderOpts = {},
): RenderedImage {
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

	if (sprite.cells.length > 0 && sprite.ops.length > 0) {
		throw new RenderError(
			`Sprite \`${sprite.name}\` mixes a cell grid with ops; choose one mode.`,
			{
				code: "render.mixed_body",
				severity: "error",
				message: `Sprite \`${sprite.name}\` mixes a cell grid with shape ops.`,
				loc: sprite.loc,
				hint: "A sprite body is either a cell grid or a sequence of ops, not both.",
			},
		);
	}

	let pixels: Rgba[];
	if (sprite.ops.length > 0) {
		pixels = renderOps(sprite, palette);
	} else {
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
		pixels = sprite.cells.map((c) => resolveCell(c, palette, sprite.name));
	}

	const scaled = nearestNeighbor(pixels, sprite.width, sprite.height, scale);
	const width = sprite.width * scale;
	const height = sprite.height * scale;
	const data = new Uint8Array(width * height * 4);
	for (let i = 0; i < scaled.length; i++) {
		const { r, g, b, a } = scaled[i];
		data[i * 4 + 0] = r;
		data[i * 4 + 1] = g;
		data[i * 4 + 2] = b;
		data[i * 4 + 3] = a;
	}
	return { width, height, data };
}

export function render(program: Program, opts: RenderOpts = {}): Uint8Array {
	const { width, height, data } = renderPixels(program, opts);
	const png = new PNG({ width, height });
	png.data.set(data);
	return new Uint8Array(PNG.sync.write(png));
}
