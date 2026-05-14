export interface Location {
	line: number;
	col: number;
}

export interface Program {
	type: "Program";
	palettes: PaletteDecl[];
	sprites: SpriteDecl[];
	invocations: Invocation[];
}

export interface PaletteDecl {
	type: "PaletteDecl";
	name: string;
	entries: PaletteEntry[];
	loc: Location;
}

export interface PaletteEntry {
	type: "PaletteEntry";
	long: string;
	short: string;
	hex: string;
	loc: Location;
}

export interface SpriteDecl {
	type: "SpriteDecl";
	name: string;
	params: SpriteParam[];
	width: number;
	height: number;
	palette?: string;
	cells: Cell[];
	ops: SpriteOp[];
	loc: Location;
}

export type SpriteOp = FillOp | RectOp | PixelOp | LineOp | CircleOp;

export type OpValue = PaletteRef | HexValue | TransparentCell;

export interface FillOp {
	type: "FillOp";
	value: OpValue;
	loc: Location;
}

export interface RectOp {
	type: "RectOp";
	x0: number;
	y0: number;
	x1: number;
	y1: number;
	value: OpValue;
	loc: Location;
}

export interface PixelOp {
	type: "PixelOp";
	x: number;
	y: number;
	value: OpValue;
	loc: Location;
}

export interface LineOp {
	type: "LineOp";
	x0: number;
	y0: number;
	x1: number;
	y1: number;
	value: OpValue;
	loc: Location;
}

export interface CircleOp {
	type: "CircleOp";
	cx: number;
	cy: number;
	r: number;
	value: OpValue;
	loc: Location;
}

export interface SpriteParam {
	type: "SpriteParam";
	name: string;
	default: PaletteRef | HexValue;
	loc: Location;
}

export interface Invocation {
	type: "Invocation";
	name: string;
	args: InvocationArg[];
	loc: Location;
}

export interface InvocationArg {
	type: "InvocationArg";
	name: string;
	value: PaletteRef | HexValue;
	loc: Location;
}

export type Cell = PaletteRef | HexValue | TransparentCell;

export interface PaletteRef {
	type: "PaletteRef";
	name: string;
	loc: Location;
}

export interface HexValue {
	type: "HexValue";
	hex: string;
	loc: Location;
}

export interface TransparentCell {
	type: "TransparentCell";
	loc: Location;
}
