import type { ILexingError, IRecognitionException, IToken } from "chevrotain";

export type Severity = "error" | "warning";

export interface Diagnostic {
	code: string;
	severity: Severity;
	message: string;
	loc: { line: number; col: number };
	hint?: string;
}

export function lexingErrorToDiagnostic(err: ILexingError): Diagnostic {
	return {
		code: "lex.unknown_char",
		severity: "error",
		message: err.message,
		loc: { line: err.line ?? 1, col: err.column ?? 1 },
	};
}

export function parsingErrorToDiagnostic(
	err: IRecognitionException,
	fallback?: IToken,
): Diagnostic {
	// EOF tokens carry NaN positions; fall back to the last real token from the lex stream.
	const tok = Number.isFinite(err.token.startLine)
		? err.token
		: (fallback ?? err.token);
	return {
		code: "parse.unexpected",
		severity: "error",
		message: err.message,
		loc: {
			line: Number.isFinite(tok.startLine) ? (tok.startLine as number) : 1,
			col: Number.isFinite(tok.startColumn) ? (tok.startColumn as number) : 1,
		},
	};
}
