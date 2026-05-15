// Browser stub for pngjs — the playground only uses renderPixels(), never
// render(), so pngjs's Node-only deps never execute. This stub satisfies the
// type-level import without pulling in `zlib`/`util`/`buffer`.

class PNGStub {
	width = 0;
	height = 0;
	data = new Uint8Array(0);

	constructor(
		opts: { width: number; height: number } = { width: 0, height: 0 },
	) {
		this.width = opts.width;
		this.height = opts.height;
	}

	static sync = {
		read(_: Uint8Array): { width: number; height: number; data: Uint8Array } {
			throw new Error("PNG decoding unavailable in the browser stub.");
		},
		write(_: PNGStub): Uint8Array {
			throw new Error("PNG encoding unavailable in the browser stub.");
		},
	};
}

export const PNG = PNGStub;
export default { PNG: PNGStub };
