import { CstParser } from "chevrotain";
import {
	allTokens,
	Circle,
	Comma,
	Dimensions,
	Dot,
	Equals,
	Fill,
	Flip,
	HexColor,
	Identifier,
	Integer,
	LBrace,
	Line,
	Palette,
	Pixel,
	RBrace,
	Rect,
	Slash,
	Sprite,
} from "./tokens.js";

class PixelParser extends CstParser {
	constructor() {
		super(allTokens);
		this.performSelfAnalysis();
	}

	public program = this.RULE("program", () => {
		this.MANY(() => {
			this.OR([
				{ ALT: () => this.SUBRULE(this.paletteDecl) },
				{ ALT: () => this.SUBRULE(this.spriteDecl) },
			]);
		});
	});

	private paletteDecl = this.RULE("paletteDecl", () => {
		this.CONSUME(Palette);
		this.CONSUME(Identifier, { LABEL: "name" });
		this.CONSUME(LBrace);
		this.MANY(() => this.SUBRULE(this.paletteEntry));
		this.CONSUME(RBrace);
	});

	private paletteEntry = this.RULE("paletteEntry", () => {
		this.CONSUME(Identifier, { LABEL: "long" });
		this.CONSUME2(Identifier, { LABEL: "short" });
		this.CONSUME(HexColor);
	});

	private spriteDecl = this.RULE("spriteDecl", () => {
		this.CONSUME(Sprite);
		this.CONSUME(Identifier, { LABEL: "name" });
		this.CONSUME(Dimensions);
		this.OPTION(() => {
			this.CONSUME(Palette);
			this.CONSUME(Equals);
			this.CONSUME2(Identifier, { LABEL: "paletteName" });
		});
		this.CONSUME(LBrace);
		this.MANY(() => {
			this.OR([
				{ ALT: () => this.SUBRULE(this.op) },
				{ ALT: () => this.SUBRULE(this.cell) },
				{ ALT: () => this.CONSUME(Slash) },
			]);
		});
		this.CONSUME(RBrace);
	});

	private cell = this.RULE("cell", () => {
		this.OR([
			{ ALT: () => this.CONSUME(Identifier) },
			{ ALT: () => this.CONSUME(HexColor) },
			{ ALT: () => this.CONSUME(Dot) },
		]);
	});

	private op = this.RULE("op", () => {
		this.OR([
			{ ALT: () => this.SUBRULE(this.fillOp) },
			{ ALT: () => this.SUBRULE(this.rectOp) },
			{ ALT: () => this.SUBRULE(this.pixelOp) },
			{ ALT: () => this.SUBRULE(this.lineOp) },
			{ ALT: () => this.SUBRULE(this.circleOp) },
			{ ALT: () => this.SUBRULE(this.flipOp) },
		]);
	});

	private fillOp = this.RULE("fillOp", () => {
		this.CONSUME(Fill);
		this.SUBRULE(this.opValue);
	});

	private rectOp = this.RULE("rectOp", () => {
		this.CONSUME(Rect);
		this.SUBRULE(this.coord, { LABEL: "from" });
		this.SUBRULE2(this.coord, { LABEL: "to" });
		this.SUBRULE(this.opValue);
	});

	private pixelOp = this.RULE("pixelOp", () => {
		this.CONSUME(Pixel);
		this.SUBRULE(this.coord, { LABEL: "at" });
		this.SUBRULE(this.opValue);
	});

	private lineOp = this.RULE("lineOp", () => {
		this.CONSUME(Line);
		this.SUBRULE(this.coord, { LABEL: "from" });
		this.SUBRULE2(this.coord, { LABEL: "to" });
		this.SUBRULE(this.opValue);
	});

	private circleOp = this.RULE("circleOp", () => {
		this.CONSUME(Circle);
		this.SUBRULE(this.coord, { LABEL: "center" });
		this.CONSUME(Integer, { LABEL: "radius" });
		this.SUBRULE(this.opValue);
	});

	private flipOp = this.RULE("flipOp", () => {
		this.CONSUME(Flip);
		this.CONSUME(Identifier, { LABEL: "axis" });
	});

	private coord = this.RULE("coord", () => {
		this.CONSUME(Integer, { LABEL: "x" });
		this.CONSUME(Comma);
		this.CONSUME2(Integer, { LABEL: "y" });
	});

	private opValue = this.RULE("opValue", () => {
		this.OR([
			{ ALT: () => this.CONSUME(Identifier) },
			{ ALT: () => this.CONSUME(HexColor) },
			{ ALT: () => this.CONSUME(Dot) },
		]);
	});
}

export const parserInstance = new PixelParser();
