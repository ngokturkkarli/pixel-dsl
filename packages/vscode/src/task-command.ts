import * as path from "node:path";

export function pixBuildShellCommand(
	folderPath: string,
	relPix: string,
	scale: number,
): string {
	const png = relPix.replace(/\.pix$/, ".png");
	const cli = path.join(folderPath, "packages", "cli", "dist", "index.js");
	return `node "${cli}" build "${relPix}" -o "${png}" -s ${scale}`;
}
