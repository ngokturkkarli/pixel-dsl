import * as vscode from "vscode";
import { colorSpansFromText } from "./color-spans.js";

const hexDecoration = vscode.window.createTextEditorDecorationType({
	before: {
		contentText: "■",
		margin: "0 4px 0 0",
	},
});

function updateDecorations(editor: vscode.TextEditor): void {
	if (editor.document.languageId !== "pix") return;

	const text = editor.document.getText();
	const decorations: vscode.DecorationOptions[] = colorSpansFromText(text).map(
		(span) => ({
			range: new vscode.Range(
				editor.document.positionAt(span.start),
				editor.document.positionAt(span.end),
			),
			renderOptions: { before: { color: span.css } },
		}),
	);

	editor.setDecorations(hexDecoration, decorations);
}

export function registerColorDecorators(
	context: vscode.ExtensionContext,
): void {
	const refresh = (editor?: vscode.TextEditor) => {
		const ed = editor ?? vscode.window.activeTextEditor;
		if (ed) updateDecorations(ed);
	};

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(refresh),
		vscode.workspace.onDidChangeTextDocument((e) => {
			const editor = vscode.window.activeTextEditor;
			if (editor?.document === e.document) refresh(editor);
		}),
		hexDecoration,
	);
	refresh();
}
