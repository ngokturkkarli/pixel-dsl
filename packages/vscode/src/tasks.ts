import * as path from "node:path";
import * as vscode from "vscode";
import { getScale } from "./config.js";
import { pixBuildShellCommand } from "./task-command.js";

export { pixBuildShellCommand } from "./task-command.js";

export function registerTaskProvider(context: vscode.ExtensionContext): void {
	context.subscriptions.push(
		vscode.tasks.registerTaskProvider("pixel-dsl", {
			provideTasks() {
				const folder = vscode.workspace.workspaceFolders?.[0];
				if (!folder) return [];

				return vscode.workspace
					.findFiles("**/*.pix", "**/node_modules/**")
					.then((files) =>
						files.slice(0, 20).map((uri) => {
							const rel = path.relative(folder.uri.fsPath, uri.fsPath);
							const scale = getScale();
							const task = new vscode.Task(
								{ type: "pixel-dsl", file: rel },
								folder,
								`Build ${rel}`,
								"pixel-dsl",
								new vscode.ShellExecution(
									pixBuildShellCommand(folder.uri.fsPath, rel, scale),
									{ cwd: folder.uri.fsPath },
								),
								"$pixel-dsl",
							);
							task.group = vscode.TaskGroup.Build;
							return task;
						}),
					);
			},
			resolveTask(task) {
				return task;
			},
		}),
	);
}
