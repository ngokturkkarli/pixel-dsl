import { parse } from "@pixel-dsl/core";

export interface PixOutlineSymbol {
	name: string;
	kind: "palette" | "sprite";
	detail: string;
	line: number;
	col: number;
}

export function outlineFromSource(source: string): PixOutlineSymbol[] {
	const { ast } = parse(source);
	if (!ast) return [];

	const symbols: PixOutlineSymbol[] = [];

	for (const palette of ast.palettes) {
		symbols.push({
			name: palette.name,
			kind: "palette",
			detail: "palette",
			line: palette.loc.line,
			col: palette.loc.col,
		});
	}

	for (const sprite of ast.sprites) {
		symbols.push({
			name: sprite.name,
			kind: "sprite",
			detail: `${sprite.width}×${sprite.height}`,
			line: sprite.loc.line,
			col: sprite.loc.col,
		});
	}

	return symbols;
}
