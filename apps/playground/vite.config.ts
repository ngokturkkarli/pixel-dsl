import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@pixel-dsl/core": resolve(here, "../../packages/core/src/index.ts"),
			pngjs: resolve(here, "src/pngjs-stub.ts"),
		},
	},
	optimizeDeps: {
		exclude: ["pngjs"],
	},
});
