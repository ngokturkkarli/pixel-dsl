import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");
const here = dirname(fileURLToPath(import.meta.url));
const ext = resolve(here, "..");
const root = resolve(ext, "../..");
const pngjsStub = resolve(root, "packages/core/src/pngjs-stub.ts");

mkdirSync(resolve(ext, "dist"), { recursive: true });

const common = { bundle: true, logLevel: "info", sourcemap: true };
const builds = [
	{
		...common,
		entryPoints: [resolve(ext, "src/extension.ts")],
		outfile: resolve(ext, "dist/extension.js"),
		platform: "node",
		format: "cjs",
		external: ["vscode"],
	},
	{
		...common,
		entryPoints: [resolve(ext, "src/preview/webview.ts")],
		outfile: resolve(ext, "dist/webview.js"),
		platform: "browser",
		format: "iife",
		alias: { pngjs: pngjsStub },
	},
	{
		...common,
		entryPoints: [resolve(root, "packages/lsp/src/server.ts")],
		outfile: resolve(ext, "dist/server.js"),
		platform: "node",
		format: "cjs",
	},
];

async function run() {
	if (watch) {
		const contexts = await Promise.all(builds.map((b) => esbuild.context(b)));
		await Promise.all(contexts.map((c) => c.watch()));
		console.log("watching extension bundles…");
	} else {
		await Promise.all(builds.map((b) => esbuild.build(b)));
	}
	const stage = spawnSync(
		process.execPath,
		[resolve(here, "stage-assets.mjs")],
		{ stdio: "inherit" },
	);
	if (stage.status !== 0) process.exit(stage.status ?? 1);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
