import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("stage-assets.mjs", () => {
	it("copies lang grammar and branding into staged/", () => {
		execSync("node scripts/stage-assets.mjs", {
			cwd: pkgRoot,
			stdio: "pipe",
		});

		const grammarPath = resolve(pkgRoot, "staged/grammar/pix.tmLanguage.json");
		expect(existsSync(grammarPath)).toBe(true);

		const grammar = JSON.parse(readFileSync(grammarPath, "utf8")) as {
			scopeName: string;
		};
		expect(grammar.scopeName).toBe("source.pix");

		for (const name of ["logo.png", "favicon.png", "file-icon.png"]) {
			expect(existsSync(resolve(pkgRoot, "staged/branding", name))).toBe(true);
		}

		expect(existsSync(resolve(pkgRoot, "dist/preview.css"))).toBe(true);
	});
});
