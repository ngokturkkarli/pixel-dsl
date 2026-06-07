import * as path from "node:path";
import { compilePng, formatDiagnosticLine, parse } from "@pixel-dsl/core";
import * as vscode from "vscode";
import { getOutputDirectory, getScale } from "../config.js";
import { getSelectedSprite } from "../state.js";

async function activePixUri(): Promise<vscode.Uri | undefined> {
	const editor = vscode.window.activeTextEditor;
	if (!editor || editor.document.languageId !== "pix") {
		vscode.window.showWarningMessage("Open a .pix file to build.");
		return undefined;
	}
	return editor.document.uri;
}

export function registerBuildCommands(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.commands.registerCommand("pixel-dsl.build", async () => {
			const uri = await activePixUri();
			if (!uri) return;

			const source = Buffer.from(
				await vscode.workspace.fs.readFile(uri),
			).toString("utf8");
			const { bytes, diagnostics } = compilePng(source, {
				scale: getScale(),
				spriteName: getSelectedSprite(),
			});
			if (!bytes) {
				vscode.window.showErrorMessage(
					diagnostics.map(formatDiagnosticLine).join("\n"),
				);
				return;
			}

			const dir = getOutputDirectory(path.dirname(uri.fsPath));
			const base = path.basename(uri.fsPath, ".pix");
			const suffix = getSelectedSprite() ? `-${getSelectedSprite()}` : "";
			const outPath = path.join(dir, `${base}${suffix}.png`);
			await vscode.workspace.fs.writeFile(vscode.Uri.file(outPath), bytes);
			vscode.window.showInformationMessage(`Built ${outPath}`);
		}),

		vscode.commands.registerCommand("pixel-dsl.buildAllSprites", async () => {
			const uri = await activePixUri();
			if (!uri) return;

			const source = Buffer.from(
				await vscode.workspace.fs.readFile(uri),
			).toString("utf8");

			const { ast, errors } = parse(source);
			if (!ast || errors.length > 0) {
				vscode.window.showErrorMessage("Parse errors — fix before building.");
				return;
			}
			if (ast.sprites.length === 0) {
				vscode.window.showWarningMessage("No sprites in file.");
				return;
			}

			const scale = getScale();
			const dir = getOutputDirectory(path.dirname(uri.fsPath));
			const base = path.basename(uri.fsPath, ".pix");

			for (const sprite of ast.sprites) {
				const { bytes, diagnostics } = compilePng(source, {
					scale,
					spriteName: sprite.name,
				});
				if (!bytes) {
					vscode.window.showErrorMessage(
						`${sprite.name}: ${diagnostics.map(formatDiagnosticLine).join("\n")}`,
					);
					return;
				}
				const outPath = path.join(dir, `${base}-${sprite.name}.png`);
				await vscode.workspace.fs.writeFile(vscode.Uri.file(outPath), bytes);
			}

			vscode.window.showInformationMessage(
				`Built ${ast.sprites.length} sprite(s).`,
			);
		}),
	);
}
