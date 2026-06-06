import type { CstNode, IToken } from "chevrotain";
import type {
	Cell,
	CircleOp,
	FillOp,
	FlipOp,
	LineOp,
	Location,
	OpValue,
	PaletteDecl,
	PaletteEntry,
	PixelOp,
	Program,
	RectOp,
	SpriteDecl,
	SpriteOp,
} from "./ast.js";
import { parserInstance } from "./parser.js";

function locOf(token: IToken): Location {
	return { line: token.startLine ?? 1, col: token.startColumn ?? 1 };
}

const BaseVisitor = parserInstance.getBaseCstVisitorConstructor<
	undefined,
	unknown
>();

class PixelAstBuilder extends BaseVisitor {
	constructor() {
		super();
		this.validateVisitor();
	}

	program(ctx: { paletteDecl?: CstNode[]; spriteDecl?: CstNode[] }): Program {
		return {
			type: "Program",
			palettes: (ctx.paletteDecl ?? []).map(
				(n) => this.visit(n) as PaletteDecl,
			),
			sprites: (ctx.spriteDecl ?? []).map((n) => this.visit(n) as SpriteDecl),
		};
	}

	paletteDecl(ctx: {
		Palette: IToken[];
		name: IToken[];
		paletteEntry?: CstNode[];
	}): PaletteDecl {
		return {
			type: "PaletteDecl",
			name: ctx.name[0].image,
			entries: (ctx.paletteEntry ?? []).map(
				(n) => this.visit(n) as PaletteEntry,
			),
			loc: locOf(ctx.Palette[0]),
		};
	}

	paletteEntry(ctx: {
		long: IToken[];
		short: IToken[];
		HexColor: IToken[];
	}): PaletteEntry {
		return {
			type: "PaletteEntry",
			long: ctx.long[0].image,
			short: ctx.short[0].image,
			hex: ctx.HexColor[0].image,
			loc: locOf(ctx.long[0]),
		};
	}

	spriteDecl(ctx: {
		Sprite: IToken[];
		name: IToken[];
		Dimensions: IToken[];
		paletteName?: IToken[];
		cell?: CstNode[];
		op?: CstNode[];
	}): SpriteDecl {
		const [w, h] = ctx.Dimensions[0].image.split("x").map(Number);
		return {
			type: "SpriteDecl",
			name: ctx.name[0].image,
			width: w,
			height: h,
			palette: ctx.paletteName?.[0].image,
			cells: (ctx.cell ?? []).map((n) => this.visit(n) as Cell),
			ops: (ctx.op ?? []).map((n) => this.visit(n) as SpriteOp),
			loc: locOf(ctx.Sprite[0]),
		};
	}

	cell(ctx: {
		Identifier?: IToken[];
		HexColor?: IToken[];
		Dot?: IToken[];
	}): Cell {
		if (ctx.Identifier) {
			const tok = ctx.Identifier[0];
			return { type: "PaletteRef", name: tok.image, loc: locOf(tok) };
		}
		if (ctx.HexColor) {
			const tok = ctx.HexColor[0];
			return { type: "HexValue", hex: tok.image, loc: locOf(tok) };
		}
		if (ctx.Dot) {
			return { type: "TransparentCell", loc: locOf(ctx.Dot[0]) };
		}
		throw new Error("cell: parser guarantees Identifier | HexColor | Dot");
	}

	op(ctx: {
		fillOp?: CstNode[];
		rectOp?: CstNode[];
		pixelOp?: CstNode[];
		lineOp?: CstNode[];
		circleOp?: CstNode[];
		flipOp?: CstNode[];
	}): SpriteOp {
		const node =
			ctx.fillOp?.[0] ??
			ctx.rectOp?.[0] ??
			ctx.pixelOp?.[0] ??
			ctx.lineOp?.[0] ??
			ctx.circleOp?.[0] ??
			ctx.flipOp?.[0];
		if (!node) throw new Error("op: parser guarantees one of the op kinds");
		return this.visit(node) as SpriteOp;
	}

	opValue(ctx: {
		Identifier?: IToken[];
		HexColor?: IToken[];
		Dot?: IToken[];
	}): OpValue {
		if (ctx.Identifier) {
			const tok = ctx.Identifier[0];
			return { type: "PaletteRef", name: tok.image, loc: locOf(tok) };
		}
		if (ctx.HexColor) {
			const tok = ctx.HexColor[0];
			return { type: "HexValue", hex: tok.image, loc: locOf(tok) };
		}
		if (ctx.Dot) {
			return { type: "TransparentCell", loc: locOf(ctx.Dot[0]) };
		}
		throw new Error("opValue: parser guarantees Identifier | HexColor | Dot");
	}

	coord(ctx: { x: IToken[]; y: IToken[] }): { x: number; y: number } {
		return {
			x: Number.parseInt(ctx.x[0].image, 10),
			y: Number.parseInt(ctx.y[0].image, 10),
		};
	}

	fillOp(ctx: { Fill: IToken[]; opValue: CstNode[] }): FillOp {
		return {
			type: "FillOp",
			value: this.visit(ctx.opValue[0]) as OpValue,
			loc: locOf(ctx.Fill[0]),
		};
	}

	rectOp(ctx: {
		Rect: IToken[];
		from: CstNode[];
		to: CstNode[];
		opValue: CstNode[];
	}): RectOp {
		const from = this.visit(ctx.from[0]) as { x: number; y: number };
		const to = this.visit(ctx.to[0]) as { x: number; y: number };
		return {
			type: "RectOp",
			x0: from.x,
			y0: from.y,
			x1: to.x,
			y1: to.y,
			value: this.visit(ctx.opValue[0]) as OpValue,
			loc: locOf(ctx.Rect[0]),
		};
	}

	pixelOp(ctx: {
		Pixel: IToken[];
		at: CstNode[];
		opValue: CstNode[];
	}): PixelOp {
		const at = this.visit(ctx.at[0]) as { x: number; y: number };
		return {
			type: "PixelOp",
			x: at.x,
			y: at.y,
			value: this.visit(ctx.opValue[0]) as OpValue,
			loc: locOf(ctx.Pixel[0]),
		};
	}

	lineOp(ctx: {
		Line: IToken[];
		from: CstNode[];
		to: CstNode[];
		opValue: CstNode[];
	}): LineOp {
		const from = this.visit(ctx.from[0]) as { x: number; y: number };
		const to = this.visit(ctx.to[0]) as { x: number; y: number };
		return {
			type: "LineOp",
			x0: from.x,
			y0: from.y,
			x1: to.x,
			y1: to.y,
			value: this.visit(ctx.opValue[0]) as OpValue,
			loc: locOf(ctx.Line[0]),
		};
	}

	circleOp(ctx: {
		Circle: IToken[];
		center: CstNode[];
		radius: IToken[];
		opValue: CstNode[];
	}): CircleOp {
		const center = this.visit(ctx.center[0]) as { x: number; y: number };
		return {
			type: "CircleOp",
			cx: center.x,
			cy: center.y,
			r: Number.parseInt(ctx.radius[0].image, 10),
			value: this.visit(ctx.opValue[0]) as OpValue,
			loc: locOf(ctx.Circle[0]),
		};
	}

	flipOp(ctx: { Flip: IToken[]; axis: IToken[] }): FlipOp {
		return {
			type: "FlipOp",
			axis: ctx.axis[0].image,
			loc: locOf(ctx.Flip[0]),
		};
	}
}

export const astBuilder = new PixelAstBuilder();
