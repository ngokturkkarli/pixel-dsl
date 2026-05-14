import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"],
	},
	resolve: {
		alias: {
			"@pixel-dsl/core": resolve(here, "../core/src/index.ts"),
		},
	},
});
