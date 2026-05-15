import { defineConfig } from "vitepress";

export default defineConfig({
	title: "Pixel-DSL",
	description: "A deterministic, LLM-friendly DSL for pixel art sprites.",
	themeConfig: {
		nav: [
			{ text: "Guide", link: "/guide/getting-started" },
			{ text: "Grammar", link: "/guide/grammar" },
			{ text: "Examples", link: "/examples/" },
		],
		sidebar: {
			"/guide/": [
				{
					text: "Guide",
					items: [
						{ text: "Getting started", link: "/guide/getting-started" },
						{ text: "Grammar reference", link: "/guide/grammar" },
						{ text: "CLI usage", link: "/guide/cli" },
						{ text: "Shape ops", link: "/guide/shape-ops" },
					],
				},
			],
			"/examples/": [
				{
					text: "Examples",
					items: [
						{ text: "Overview", link: "/examples/" },
						{ text: "Hero (8x8)", link: "/examples/hero" },
						{ text: "Jolly Roger flag", link: "/examples/flag" },
					],
				},
			],
		},
		socialLinks: [
			{ icon: "github", link: "https://github.com/msyavuz/pixel-dsl" },
		],
	},
});
