import { describe, expect, it } from "vitest";
import {
	resolveDefaultSpriteName,
	resolveOutputDirectory,
	resolvePreviewScale,
	resolveScale,
} from "./config-resolvers.js";

describe("resolveScale", () => {
	it("defaults to 16 and enforces minimum 1", () => {
		expect(resolveScale(undefined)).toBe(16);
		expect(resolveScale(0)).toBe(1);
		expect(resolveScale(-3)).toBe(1);
		expect(resolveScale(32)).toBe(32);
	});
});

describe("resolvePreviewScale", () => {
	it("caps auto preview scale at 8", () => {
		expect(resolvePreviewScale(undefined, 16)).toBe(8);
		expect(resolvePreviewScale(0, 16)).toBe(8);
	});

	it("uses explicit positive preview scale", () => {
		expect(resolvePreviewScale(4, 16)).toBe(4);
	});
});

describe("resolveOutputDirectory", () => {
	it("falls back when configured path is empty", () => {
		expect(resolveOutputDirectory("", "/out")).toBe("/out");
		expect(resolveOutputDirectory("  ", "/out")).toBe("/out");
		expect(resolveOutputDirectory("/custom", "/out")).toBe("/custom");
	});
});

describe("resolveDefaultSpriteName", () => {
	it("maps first to undefined", () => {
		expect(resolveDefaultSpriteName("first")).toBeUndefined();
		expect(resolveDefaultSpriteName("hero")).toBe("hero");
	});
});
