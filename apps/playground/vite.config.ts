import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
	// Served under https://pixel-dsl.com/playground/ in production;
	// kept at root during local `vite` dev.
	base: command === "build" ? "/playground/" : "/",
	plugins: [react()],
	resolve: {
		alias: {
			"@pixel-dsl/core": resolve(here, "../../packages/core/src/index.ts"),
			pngjs: resolve(here, "../../packages/core/src/pngjs-stub.ts"),
		},
	},
	optimizeDeps: {
		exclude: ["pngjs"],
	},
}));
