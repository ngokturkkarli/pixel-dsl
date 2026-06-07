import * as vscode from "vscode";
import {
	getDefaultSpriteName,
	getPreviewDebounceMs,
	getPreviewScale,
} from "../config.js";
import { getSelectedSprite } from "../state.js";

export class PixelDslPreviewPanel {
	private static current: PixelDslPreviewPanel | undefined;
	private readonly panel: vscode.WebviewPanel;
	private disposables: vscode.Disposable[] = [];
	private debounce: ReturnType<typeof setTimeout> | undefined;
	private lastSource = "";
	private lastSprite = "";

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this.panel = panel;
		this.panel.webview.html = this.getHtml(extensionUri);
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
		this.panel.webview.onDidReceiveMessage(
			(msg) => {
				if (msg?.type === "ready") this.pushUpdate();
			},
			null,
			this.disposables,
		);

		this.disposables.push(
			vscode.workspace.onDidChangeTextDocument((e) => {
				if (
					!vscode.workspace
						.getConfiguration("pixel-dsl")
						.get("preview.enabled", true)
				) {
					return;
				}
				if (e.document.languageId !== "pix") return;
				const active = vscode.window.activeTextEditor?.document;
				if (active !== e.document) return;
				clearTimeout(this.debounce);
				this.debounce = setTimeout(
					() => this.pushUpdate(e.document),
					getPreviewDebounceMs(),
				);
			}),
			vscode.window.onDidChangeActiveTextEditor((editor) => {
				if (editor?.document.languageId === "pix")
					this.pushUpdate(editor.document);
			}),
			vscode.workspace.onDidChangeConfiguration((e) => {
				if (e.affectsConfiguration("pixel-dsl.preview.scale"))
					this.pushUpdate();
			}),
		);
	}

	static show(extensionUri: vscode.Uri): void {
		if (PixelDslPreviewPanel.current) {
			PixelDslPreviewPanel.current.panel.reveal(vscode.ViewColumn.Beside);
			PixelDslPreviewPanel.current.pushUpdate();
			return;
		}
		const panel = vscode.window.createWebviewPanel(
			"pixelDslPreview",
			"Pixel-DSL Preview",
			vscode.ViewColumn.Beside,
			{ enableScripts: true, retainContextWhenHidden: true },
		);
		PixelDslPreviewPanel.current = new PixelDslPreviewPanel(
			panel,
			extensionUri,
		);
	}

	static refreshIfOpen(): void {
		PixelDslPreviewPanel.current?.pushUpdate();
	}

	private dispose(): void {
		PixelDslPreviewPanel.current = undefined;
		clearTimeout(this.debounce);
		while (this.disposables.length) {
			this.disposables.pop()?.dispose();
		}
	}

	private spriteNameForConfig(): string | undefined {
		return getSelectedSprite() ?? getDefaultSpriteName();
	}

	private getHtml(extensionUri: vscode.Uri): string {
		const scriptUri = this.panel.webview.asWebviewUri(
			vscode.Uri.joinPath(extensionUri, "dist", "webview.js"),
		);
		const styleUri = this.panel.webview.asWebviewUri(
			vscode.Uri.joinPath(extensionUri, "dist", "preview.css"),
		);
		const csp = [
			"default-src 'none'",
			`style-src ${this.panel.webview.cspSource} 'unsafe-inline'`,
			`script-src ${this.panel.webview.cspSource}`,
		].join("; ");

		return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="${styleUri}">
</head>
<body>
  <div class="toolbar">
    <span id="status">Waiting…</span>
    <div class="zoom-controls">
      <button type="button" id="zoom-out" title="Zoom out">−</button>
      <span id="zoom-label">100%</span>
      <button type="button" id="zoom-in" title="Zoom in">+</button>
      <button type="button" id="zoom-fit" title="Fit to view">Fit</button>
      <button type="button" id="zoom-100" title="Actual pixels">1:1</button>
    </div>
  </div>
  <div id="viewport" class="viewport">
    <div class="canvas-wrap"><canvas id="canvas"></canvas></div>
  </div>
  <ul id="errors"></ul>
  <script src="${scriptUri}"></script>
</body>
</html>`;
	}

	pushUpdate(doc?: vscode.TextDocument): void {
		const document = doc ?? vscode.window.activeTextEditor?.document;
		if (!document || document.languageId !== "pix") return;

		const source = document.getText();
		const spriteName = this.spriteNameForConfig() ?? "";
		if (source === this.lastSource && spriteName === this.lastSprite) return;
		this.lastSource = source;
		this.lastSprite = spriteName;

		this.panel.webview.postMessage({
			type: "update",
			source,
			spriteName: spriteName || undefined,
			compileScale: getPreviewScale(),
		});
	}
}
