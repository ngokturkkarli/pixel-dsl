import * as path from "node:path";
import * as vscode from "vscode";
import {
	LanguageClient,
	type LanguageClientOptions,
	type ServerOptions,
	Trace,
	TransportKind,
} from "vscode-languageclient/node.js";

let client: LanguageClient | undefined;

export async function startLanguageClient(
	context: vscode.ExtensionContext,
): Promise<void> {
	const serverModule = context.asAbsolutePath(path.join("dist", "server.js"));

	const serverOptions: ServerOptions = {
		run: {
			command: process.execPath,
			args: [serverModule, "--stdio"],
			transport: TransportKind.stdio,
		},
		debug: {
			command: process.execPath,
			args: [serverModule, "--stdio", "--inspect=6010"],
			transport: TransportKind.stdio,
		},
	};

	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: "file", language: "pix" }],
		synchronize: {
			fileEvents: vscode.workspace.createFileSystemWatcher("**/*.pix"),
		},
	};

	client = new LanguageClient(
		"pixelDsl",
		"Pixel-DSL Language Server",
		serverOptions,
		clientOptions,
	);

	const trace = vscode.workspace
		.getConfiguration("pixel-dsl")
		.get<string>("lsp.trace.server", "off");
	if (trace === "messages") client.setTrace(Trace.Messages);
	else if (trace === "verbose") client.setTrace(Trace.Verbose);
	else client.setTrace(Trace.Off);

	await client.start();
}

export async function stopLanguageClient(): Promise<void> {
	if (!client) return;
	await client.stop();
	client = undefined;
}
