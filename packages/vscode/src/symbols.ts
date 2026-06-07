import * as vscode from "vscode";
import { outlineFromSource } from "./symbols-outline.js";

export type { PixOutlineSymbol } from "./symbols-outline.js";
export { outlineFromSource } from "./symbols-outline.js";

export function registerDocumentSymbols(
	context: vscode.ExtensionContext,
): void {
	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider("pix", {
			provideDocumentSymbols(document) {
				return outlineFromSource(document.getText()).map(
					(s) =>
						new vscode.DocumentSymbol(
							s.name,
							s.detail,
							s.kind === "palette"
								? vscode.SymbolKind.Namespace
								: vscode.SymbolKind.Class,
							new vscode.Range(s.line - 1, s.col - 1, s.line - 1, s.col - 1),
							new vscode.Range(s.line - 1, s.col - 1, s.line - 1, s.col - 1),
						),
				);
			},
		}),
	);
}
