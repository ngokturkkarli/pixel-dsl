import type { CstNode, IToken } from "chevrotain";
import type {
	Cell,
	HexValue,
	Invocation,
	InvocationArg,
	Location,
	PaletteDecl,
	PaletteEntry,
	PaletteRef,
	Program,
	SpriteDecl,
	SpriteParam,
} from "./ast.js";
import { parserInstance } from "./parser.js";

function locOf(token: IToken): Location {
	return { line: token.startLine ?? 1, col: token.startColumn ?? 1 };
}

function refOrHex(ctx: {
	valueRef?: IToken[];
	HexColor?: IToken[];
}): PaletteRef | HexValue {
	if (ctx.valueRef) {
		const tok = ctx.valueRef[0];
		return { type: "PaletteRef", name: tok.image, loc: locOf(tok) };
	}
	if (ctx.HexColor) {
		const tok = ctx.HexColor[0];
		return { type: "HexValue", hex: tok.image, loc: locOf(tok) };
	}
	throw new Error("refOrHex: parser guarantees valueRef | HexColor");
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

	program(ctx: {
		paletteDecl?: CstNode[];
		spriteDecl?: CstNode[];
		invocation?: CstNode[];
	}): Program {
		return {
			type: "Program",
			palettes: (ctx.paletteDecl ?? []).map(
				(n) => this.visit(n) as PaletteDecl,
			),
			sprites: (ctx.spriteDecl ?? []).map((n) => this.visit(n) as SpriteDecl),
			invocations: (ctx.invocation ?? []).map(
				(n) => this.visit(n) as Invocation,
			),
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
		spriteParams?: CstNode[];
		Dimensions: IToken[];
		paletteName?: IToken[];
		cell?: CstNode[];
	}): SpriteDecl {
		const params = ctx.spriteParams
			? (this.visit(ctx.spriteParams[0]) as SpriteParam[])
			: [];
		const [w, h] = ctx.Dimensions[0].image.split("x").map(Number);
		return {
			type: "SpriteDecl",
			name: ctx.name[0].image,
			params,
			width: w,
			height: h,
			palette: ctx.paletteName?.[0].image,
			cells: (ctx.cell ?? []).map((n) => this.visit(n) as Cell),
			loc: locOf(ctx.Sprite[0]),
		};
	}

	spriteParams(ctx: { spriteParam?: CstNode[] }): SpriteParam[] {
		return (ctx.spriteParam ?? []).map((n) => this.visit(n) as SpriteParam);
	}

	spriteParam(ctx: {
		name: IToken[];
		valueRef?: IToken[];
		HexColor?: IToken[];
	}): SpriteParam {
		return {
			type: "SpriteParam",
			name: ctx.name[0].image,
			default: refOrHex(ctx),
			loc: locOf(ctx.name[0]),
		};
	}

	invocation(ctx: { name: IToken[]; invocationArg?: CstNode[] }): Invocation {
		return {
			type: "Invocation",
			name: ctx.name[0].image,
			args: (ctx.invocationArg ?? []).map(
				(n) => this.visit(n) as InvocationArg,
			),
			loc: locOf(ctx.name[0]),
		};
	}

	invocationArg(ctx: {
		name: IToken[];
		valueRef?: IToken[];
		HexColor?: IToken[];
	}): InvocationArg {
		return {
			type: "InvocationArg",
			name: ctx.name[0].image,
			value: refOrHex(ctx),
			loc: locOf(ctx.name[0]),
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
}

export const astBuilder = new PixelAstBuilder();
