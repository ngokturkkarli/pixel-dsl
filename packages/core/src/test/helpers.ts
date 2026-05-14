import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const FIXTURES_DIR = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"fixtures",
);

export function loadFixture(name: string): string {
	return readFileSync(join(FIXTURES_DIR, name), "utf8");
}

export function decodePNG(input: string | Uint8Array): Buffer {
	const bytes =
		typeof input === "string"
			? readFileSync(join(FIXTURES_DIR, input))
			: Buffer.from(input);
	return Buffer.from(PNG.sync.read(bytes).data);
}
