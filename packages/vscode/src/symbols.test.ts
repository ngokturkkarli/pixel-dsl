import { describe, expect, it } from "vitest";
import { outlineFromSource } from "./symbols-outline.js";

const SAMPLE = `palette p {
  black k #000
}
sprite s 2x2 palette=p {
  fill k
}`;

describe("outlineFromSource", () => {
	it("returns palette and sprite outlines", () => {
		const outline = outlineFromSource(SAMPLE);
		expect(outline).toHaveLength(2);
		expect(outline[0]).toMatchObject({
			name: "p",
			kind: "palette",
			detail: "palette",
		});
		expect(outline[1]).toMatchObject({
			name: "s",
			kind: "sprite",
			detail: "2×2",
		});
	});

	it("returns empty array for invalid source", () => {
		expect(outlineFromSource("palette p {")).toEqual([]);
	});
});
