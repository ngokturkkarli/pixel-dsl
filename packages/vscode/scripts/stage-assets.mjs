import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");
const ext = resolve(here, "..");
const staged = resolve(ext, "staged");
const branding = resolve(root, "assets/branding");

const langGrammar = require.resolve("@pixel-dsl/lang/grammar");
const langConfig = require.resolve("@pixel-dsl/lang/language-configuration");
const langSnippets = require.resolve("@pixel-dsl/lang/snippets");

mkdirSync(resolve(staged, "grammar"), { recursive: true });
mkdirSync(resolve(staged, "config"), { recursive: true });
mkdirSync(resolve(staged, "snippets"), { recursive: true });
mkdirSync(resolve(staged, "branding"), { recursive: true });

// Language assets from @pixel-dsl/lang (workspace package).
cpSync(langGrammar, resolve(staged, "grammar/pix.tmLanguage.json"));
cpSync(langConfig, resolve(staged, "config/language-configuration.json"));
cpSync(langSnippets, resolve(staged, "snippets/pix.json"));

// Branding from committed assets/branding/ (canonical PNGs).
// Required for VSIX publish: extension package must be self-contained.
for (const name of ["logo.png", "favicon.png", "file-icon.png"]) {
	const src = resolve(branding, name);
	if (!existsSync(src)) {
		console.error(
			`stage-assets: missing ${src}\n` +
				"  Run: pnpm render:assets  (then commit assets/branding/)",
		);
		process.exit(1);
	}
	copyFileSync(src, resolve(staged, "branding", name));
}

mkdirSync(resolve(ext, "dist"), { recursive: true });
copyFileSync(
	resolve(ext, "src/preview/preview.css"),
	resolve(ext, "dist/preview.css"),
);
console.log("staged @pixel-dsl/lang + assets/branding for extension bundle");
