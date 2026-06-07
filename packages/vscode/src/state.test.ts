import { describe, expect, it } from "vitest";
import { getSelectedSprite, setSelectedSprite } from "./state.js";

describe("selected sprite state", () => {
	it("stores and clears the selected sprite name", () => {
		setSelectedSprite("heart");
		expect(getSelectedSprite()).toBe("heart");
		setSelectedSprite(undefined);
		expect(getSelectedSprite()).toBeUndefined();
	});
});
