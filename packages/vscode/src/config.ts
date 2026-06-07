import * as vscode from "vscode";
import {
	resolveDefaultSpriteName,
	resolveOutputDirectory,
	resolvePreviewScale,
	resolveScale,
} from "./config-resolvers.js";

export {
	resolveDefaultSpriteName,
	resolveOutputDirectory,
	resolvePreviewScale,
	resolveScale,
} from "./config-resolvers.js";

export function getScale(): number {
	return resolveScale(
		vscode.workspace.getConfiguration("pixel-dsl").get<number>("scale"),
	);
}

export function getPreviewScale(): number {
	const preview = vscode.workspace
		.getConfiguration("pixel-dsl")
		.get<number>("preview.scale");
	return resolvePreviewScale(preview, getScale());
}

export function getPreviewDebounceMs(): number {
	return vscode.workspace
		.getConfiguration("pixel-dsl")
		.get<number>("preview.debounceMs", 300);
}

export function getOutputDirectory(fallbackDir: string): string {
	return resolveOutputDirectory(
		vscode.workspace
			.getConfiguration("pixel-dsl")
			.get<string>("build.outputDirectory", ""),
		fallbackDir,
	);
}

export function getDefaultSpriteName(): string | undefined {
	return resolveDefaultSpriteName(
		vscode.workspace
			.getConfiguration("pixel-dsl")
			.get<string>("preview.defaultSprite", "first"),
	);
}
