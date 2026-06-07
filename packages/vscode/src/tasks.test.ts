import { describe, expect, it } from "vitest";
import { pixBuildShellCommand } from "./task-command.js";

describe("pixBuildShellCommand", () => {
	it("builds a shell command for the workspace CLI", () => {
		const cmd = pixBuildShellCommand("/repo", "examples/heart.pix", 16);
		expect(cmd).toContain('node "/repo/packages/cli/dist/index.js"');
		expect(cmd).toContain('build "examples/heart.pix"');
		expect(cmd).toContain('-o "examples/heart.png"');
		expect(cmd).toContain("-s 16");
	});
});
