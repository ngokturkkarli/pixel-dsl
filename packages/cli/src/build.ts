import { readFileSync, writeFileSync } from "node:fs";
import { compilePng, type Diagnostic } from "@pixel-dsl/core";
import { formatDiagnostics } from "./format.js";

export interface CompileOpts {
	scale?: number;
	spriteName?: string;
}

export interface CompileResult {
	bytes?: Uint8Array;
	errors: Diagnostic[];
}

export function compile(source: string, opts: CompileOpts = {}): CompileResult {
	const { bytes, diagnostics } = compilePng(source, opts);
	return { bytes, errors: diagnostics };
}

export interface BuildArgs {
	input: string;
	output: string;
	scale?: number;
	sprite?: string;
}

export interface BuildOutcome {
	ok: boolean;
	errors: Diagnostic[];
}

export function runBuild(args: BuildArgs): BuildOutcome {
	const source = readFileSync(args.input, "utf8");
	const { bytes, errors } = compile(source, {
		scale: args.scale,
		spriteName: args.sprite,
	});
	if (!bytes) {
		process.stderr.write(`${formatDiagnostics(errors, args.input)}\n`);
		return { ok: false, errors };
	}
	writeFileSync(args.output, Buffer.from(bytes));
	return { ok: true, errors: [] };
}
