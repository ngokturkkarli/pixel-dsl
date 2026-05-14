import { CstParser } from "chevrotain";
import {
	allTokens,
	Comma,
	Dimensions,
	Dot,
	Equals,
	HexColor,
	Identifier,
	LBrace,
	LParen,
	Palette,
	RBrace,
	RParen,
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
				{ ALT: () => this.SUBRULE(this.invocation) },
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
		this.OPTION(() => this.SUBRULE(this.spriteParams));
		this.CONSUME(Dimensions);
		this.OPTION2(() => {
			this.CONSUME(Palette);
			this.CONSUME(Equals);
			this.CONSUME2(Identifier, { LABEL: "paletteName" });
		});
		this.CONSUME(LBrace);
		this.MANY(() => {
			this.OR([
				{ ALT: () => this.SUBRULE(this.cell) },
				{ ALT: () => this.CONSUME(Slash) },
			]);
		});
		this.CONSUME(RBrace);
	});

	private spriteParams = this.RULE("spriteParams", () => {
		this.CONSUME(LParen);
		this.MANY_SEP({
			SEP: Comma,
			DEF: () => this.SUBRULE(this.spriteParam),
		});
		this.CONSUME(RParen);
	});

	private spriteParam = this.RULE("spriteParam", () => {
		this.CONSUME(Identifier, { LABEL: "name" });
		this.CONSUME(Equals);
		this.OR([
			{ ALT: () => this.CONSUME2(Identifier, { LABEL: "valueRef" }) },
			{ ALT: () => this.CONSUME(HexColor) },
		]);
	});

	private invocation = this.RULE("invocation", () => {
		this.CONSUME(Identifier, { LABEL: "name" });
		this.CONSUME(LParen);
		this.MANY_SEP({
			SEP: Comma,
			DEF: () => this.SUBRULE(this.invocationArg),
		});
		this.CONSUME(RParen);
	});

	private invocationArg = this.RULE("invocationArg", () => {
		this.CONSUME(Identifier, { LABEL: "name" });
		this.CONSUME(Equals);
		this.OR([
			{ ALT: () => this.CONSUME2(Identifier, { LABEL: "valueRef" }) },
			{ ALT: () => this.CONSUME(HexColor) },
		]);
	});

	private cell = this.RULE("cell", () => {
		this.OR([
			{ ALT: () => this.CONSUME(Identifier) },
			{ ALT: () => this.CONSUME(HexColor) },
			{ ALT: () => this.CONSUME(Dot) },
		]);
	});
}

export const parserInstance = new PixelParser();
