import { createToken, Lexer } from "chevrotain";

export const WhiteSpace = createToken({
	name: "WhiteSpace",
	pattern: /\s+/,
	group: Lexer.SKIPPED,
});

export const LineComment = createToken({
	name: "LineComment",
	pattern: /\/\/[^\r\n]*/,
	group: Lexer.SKIPPED,
});

export const HexColor = createToken({
	name: "HexColor",
	pattern: /#[0-9a-fA-F]{3,8}/,
});

export const Dimensions = createToken({
	name: "Dimensions",
	pattern: /\d+x\d+/,
});

export const Identifier = createToken({
	name: "Identifier",
	pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
});

export const Palette = createToken({
	name: "Palette",
	pattern: /palette/,
	longer_alt: Identifier,
});

export const Sprite = createToken({
	name: "Sprite",
	pattern: /sprite/,
	longer_alt: Identifier,
});

export const Dot = createToken({ name: "Dot", pattern: /\./ });

export const Slash = createToken({ name: "Slash", pattern: /\// });

export const LBrace = createToken({ name: "LBrace", pattern: /\{/ });
export const RBrace = createToken({ name: "RBrace", pattern: /\}/ });
export const LParen = createToken({ name: "LParen", pattern: /\(/ });
export const RParen = createToken({ name: "RParen", pattern: /\)/ });
export const Equals = createToken({ name: "Equals", pattern: /=/ });
export const Comma = createToken({ name: "Comma", pattern: /,/ });

export const allTokens = [
	WhiteSpace,
	LineComment,
	HexColor,
	Dimensions,
	Palette,
	Sprite,
	Identifier,
	Dot,
	Slash,
	LBrace,
	RBrace,
	LParen,
	RParen,
	Equals,
	Comma,
];

export const PixelLexer = new Lexer(allTokens, {
	positionTracking: "full",
	ensureOptimizations: true,
});
