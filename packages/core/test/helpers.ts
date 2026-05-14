import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const FIXTURES_DIR = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"fixtures",
);

export function fixturePath(name: string): string {
	return join(FIXTURES_DIR, name);
}

export function loadFixture(name: string): string {
	return readFileSync(fixturePath(name), "utf8");
}

export function decodePNG(input: string | Uint8Array): {
	width: number;
	height: number;
	data: Buffer;
} {
	const bytes =
		typeof input === "string"
			? readFileSync(fixturePath(input))
			: Buffer.from(input);
	const png = PNG.sync.read(bytes);
	return { width: png.width, height: png.height, data: Buffer.from(png.data) };
}
