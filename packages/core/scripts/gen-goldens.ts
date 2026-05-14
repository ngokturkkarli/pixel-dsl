import { writeFileSync } from "node:fs";
import { parse, render } from "../src/index.js";
import { fixturePath, loadFixture } from "../test/helpers.js";

const targets: Array<{ source: string; out: string; scale?: number }> = [
	{ source: "check-2x2.pix", out: "golden/check-2x2.png" },
	{ source: "hero-8x8.pix", out: "golden/hero-8x8.png" },
];

for (const { source, out, scale } of targets) {
	const { ast, errors } = parse(loadFixture(source));
	if (!ast) {
		console.error(`Failed to parse ${source}:`, errors);
		process.exit(1);
	}
	const bytes = render(ast, { scale });
	writeFileSync(fixturePath(out), Buffer.from(bytes));
	console.log(`wrote ${out} (${bytes.length} bytes)`);
}
