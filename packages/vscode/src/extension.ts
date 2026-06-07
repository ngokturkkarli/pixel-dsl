import { parse } from "@pixel-dsl/core";
import * as vscode from "vscode";
import { registerBuildCommands } from "./commands/build.js";
import { getDefaultSpriteName } from "./config.js";
import { registerColorDecorators } from "./decorators/colors.js";
import { startLanguageClient, stopLanguageClient } from "./lsp.js";
import { PixelDslPreviewPanel } from "./preview/panel.js";
import { getSelectedSprite, setSelectedSprite } from "./state.js";
import { registerDocumentSymbols } from "./symbols.js";
import { registerTaskProvider } from "./tasks.js";

let statusBarItem: vscode.StatusBarItem | undefined;

function updateStatusBar(): void {
	if (!statusBarItem) return;
	const sprite = getSelectedSprite() ?? getDefaultSpriteName() ?? "first";
	statusBarItem.text = `$(symbol-color) Pixel-DSL: ${sprite}`;
}

export async function activate(
	context: vscode.ExtensionContext,
): Promise<void> {
	// Register commands first so they work even if LSP startup is slow/fails.
	registerBuildCommands(context);
	context.subscriptions.push(
		vscode.commands.registerCommand("pixel-dsl.openPreview", () => {
			PixelDslPreviewPanel.show(context.extensionUri);
		}),
		vscode.commands.registerCommand("pixel-dsl.selectSprite", async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor || editor.document.languageId !== "pix") {
				vscode.window.showWarningMessage(
					"Open a .pix file to select a sprite.",
				);
				return;
			}
			const { ast } = parse(editor.document.getText());
			if (!ast || ast.sprites.length === 0) {
				vscode.window.showWarningMessage("No sprites in this file.");
				return;
			}
			const pick = await vscode.window.showQuickPick(
				ast.sprites.map((s) => ({
					label: s.name,
					description: `${s.width}×${s.height}`,
				})),
				{ placeHolder: "Select sprite to preview/build" },
			);
			if (!pick) return;
			setSelectedSprite(pick.label);
			updateStatusBar();
			PixelDslPreviewPanel.refreshIfOpen();
		}),
	);

	registerColorDecorators(context);
	registerDocumentSymbols(context);
	registerTaskProvider(context);

	statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		100,
	);
	statusBarItem.command = "pixel-dsl.selectSprite";
	updateStatusBar();
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// LSP in background — do not block command registration.
	void startLanguageClient(context).catch((err: unknown) => {
		const msg = err instanceof Error ? err.message : String(err);
		void vscode.window.showErrorMessage(
			`Pixel-DSL language server failed to start: ${msg}`,
		);
	});
}

export async function deactivate(): Promise<void> {
	await stopLanguageClient();
}
