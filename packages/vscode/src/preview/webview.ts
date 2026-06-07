import { compilePreview, formatDiagnosticLine } from "@pixel-dsl/core";

interface UpdateMessage {
	type: "update";
	source: string;
	spriteName?: string;
	compileScale: number;
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const wrap = document.querySelector(".canvas-wrap") as HTMLDivElement;
const viewport = document.getElementById("viewport") as HTMLDivElement;
const statusEl = document.getElementById("status") as HTMLSpanElement;
const errorsEl = document.getElementById("errors") as HTMLUListElement;
const zoomLabel = document.getElementById("zoom-label") as HTMLSpanElement;

let viewZoom = 1;
let compileScale = 8;
let pending: UpdateMessage | null = null;
let raf = 0;

function applyViewZoom(): void {
	wrap.style.transform = `scale(${viewZoom})`;
	zoomLabel.textContent = `${Math.round(viewZoom * 100)}%`;
}

function fitToView(): void {
	const pad = 16;
	const maxW = Math.max(1, viewport.clientWidth - pad);
	const maxH = Math.max(1, viewport.clientHeight - pad);
	if (canvas.width === 0 || canvas.height === 0) return;
	viewZoom = Math.min(maxW / canvas.width, maxH / canvas.height, 1);
	applyViewZoom();
}

function compileAndRender(msg: UpdateMessage): void {
	errorsEl.innerHTML = "";
	compileScale = msg.compileScale;

	const result = compilePreview(msg.source, {
		scale: compileScale,
		spriteName: msg.spriteName,
	});

	if (result.diagnostics.length > 0 || !result.image) {
		statusEl.textContent = "Compile errors";
		for (const d of result.diagnostics) {
			const li = document.createElement("li");
			li.textContent = formatDiagnosticLine(d);
			errorsEl.appendChild(li);
		}
		canvas.width = 0;
		canvas.height = 0;
		return;
	}

	const img = result.image;
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const clamped = new Uint8ClampedArray(img.width * img.height * 4);
	clamped.set(img.data);
	ctx.putImageData(new ImageData(clamped, img.width, img.height), 0, 0);
	statusEl.textContent = `Sprite: ${result.spriteName ?? "?"} (${img.width}×${img.height} @${compileScale}×)`;
	fitToView();
}

function schedule(msg: UpdateMessage): void {
	pending = msg;
	if (raf) return;
	raf = requestAnimationFrame(() => {
		raf = 0;
		if (pending) compileAndRender(pending);
		pending = null;
	});
}

document.getElementById("zoom-in")?.addEventListener("click", () => {
	viewZoom = Math.min(viewZoom * 1.25, 32);
	applyViewZoom();
});
document.getElementById("zoom-out")?.addEventListener("click", () => {
	viewZoom = Math.max(viewZoom / 1.25, 0.05);
	applyViewZoom();
});
document.getElementById("zoom-fit")?.addEventListener("click", fitToView);
document.getElementById("zoom-100")?.addEventListener("click", () => {
	viewZoom = 1;
	applyViewZoom();
});

viewport.addEventListener(
	"wheel",
	(e) => {
		if (!e.ctrlKey && !e.metaKey) return;
		e.preventDefault();
		const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
		viewZoom = Math.min(Math.max(viewZoom * factor, 0.05), 32);
		applyViewZoom();
	},
	{ passive: false },
);

const vscodeApi = acquireVsCodeApi();
window.addEventListener("message", (event) => {
	const msg = event.data as UpdateMessage;
	if (msg?.type === "update") schedule(msg);
});

vscodeApi.postMessage({ type: "ready" });
