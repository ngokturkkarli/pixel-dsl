import type { Program } from "./ast.js";
import type { Diagnostic } from "./errors.js";
import { parse } from "./index.js";
import {
	RenderError,
	type RenderedImage,
	render,
	renderPixels,
} from "./render.js";

export interface PreviewOpts {
	scale?: number;
	spriteName?: string;
}

export interface PreviewResult {
	image: RenderedImage | null;
	diagnostics: Diagnostic[];
	spriteName?: string;
}

export interface PngCompileResult {
	bytes?: Uint8Array;
	diagnostics: Diagnostic[];
}

/** Resolve sprite name: preferred if valid, otherwise first sprite in the program. */
export function pickSpriteName(
	program: Program,
	preferred?: string,
): string | undefined {
	if (preferred && program.sprites.some((s) => s.name === preferred)) {
		return preferred;
	}
	return program.sprites[0]?.name;
}

/** Parse + renderPixels — shared live-preview pipeline for playground and VS Code webview. */
export function compilePreview(
	source: string,
	opts: PreviewOpts = {},
): PreviewResult {
	const { ast, errors } = parse(source);
	if (!ast || errors.length > 0) {
		return { image: null, diagnostics: errors, spriteName: undefined };
	}

	const spriteName = pickSpriteName(ast, opts.spriteName);
	try {
		const image = renderPixels(ast, {
			scale: opts.scale,
			spriteName,
		});
		return { image, diagnostics: [], spriteName };
	} catch (e) {
		if (e instanceof RenderError) {
			return {
				image: null,
				diagnostics: [e.diagnostic],
				spriteName,
			};
		}
		throw e;
	}
}

/** Parse + render → PNG bytes — shared build pipeline for CLI and extension build commands. */
export function compilePng(
	source: string,
	opts: PreviewOpts = {},
): PngCompileResult {
	const { ast, errors } = parse(source);
	if (!ast || errors.length > 0) {
		return { diagnostics: errors };
	}

	try {
		const bytes = render(ast, {
			scale: opts.scale,
			spriteName: opts.spriteName,
		});
		return { bytes, diagnostics: [] };
	} catch (e) {
		if (e instanceof RenderError) {
			return { diagnostics: [e.diagnostic] };
		}
		throw e;
	}
}

/** Format a diagnostic as a single display line (preview UIs). */
export function formatDiagnosticLine(d: Diagnostic): string {
	const head = `${d.loc.line}:${d.loc.col} [${d.code}] ${d.message}`;
	return d.hint ? `${head} — ${d.hint}` : head;
}
