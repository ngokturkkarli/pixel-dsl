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
