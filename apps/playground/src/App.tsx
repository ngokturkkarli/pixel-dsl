import {
	compilePreview,
	type Diagnostic,
	formatDiagnosticLine,
} from "@pixel-dsl/core";
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_SOURCE = `palette nes {
  black k #000000
  white w #ffffff
  red   r #ff3030
}

sprite flag 16x12 palette=nes {
  fill k
  circle 8,5 3 w
  pixel 7,5 k
  pixel 9,5 k
  rect 6,7 9,7 w
  line 4,9 11,11 w
  line 11,9 4,11 w
  rect 5,11 10,11 r
}
`;

const SCALE = 16;

export function App() {
	const [source, setSource] = useState(() => {
		try {
			const fromHash = window.location.hash.slice(1);
			if (fromHash) return atob(decodeURIComponent(fromHash));
		} catch {
			/* fall through */
		}
		return DEFAULT_SOURCE;
	});
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const { diagnostics, image } = useMemo(
		() => compilePreview(source, { scale: SCALE }),
		[source],
	);

	useEffect(() => {
		if (!image || !canvasRef.current) return;
		const canvas = canvasRef.current;
		canvas.width = image.width;
		canvas.height = image.height;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const clamped = new Uint8ClampedArray(image.width * image.height * 4);
		clamped.set(image.data);
		ctx.putImageData(new ImageData(clamped, image.width, image.height), 0, 0);
	}, [image]);

	const shareLink = () => {
		const encoded = encodeURIComponent(btoa(source));
		window.location.hash = encoded;
		navigator.clipboard?.writeText(window.location.href);
	};

	const downloadPng = () => {
		const canvas = canvasRef.current;
		if (!canvas || !image) return;
		canvas.toBlob((blob) => {
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "sprite.png";
			a.click();
			URL.revokeObjectURL(url);
		});
	};

	return (
		<div className="layout">
			<header className="header">
				<h1>Pixel-DSL Playground</h1>
				<button type="button" onClick={shareLink}>
					Copy share link
				</button>
				<button type="button" onClick={downloadPng} disabled={!image}>
					Download PNG
				</button>
			</header>
			<div className="split">
				<div className="pane editor">
					<textarea
						value={source}
						onChange={(e) => setSource(e.target.value)}
						spellCheck={false}
					/>
				</div>
				<div className="pane preview">
					<canvas ref={canvasRef} />
					<DiagnosticPanel diagnostics={diagnostics} />
				</div>
			</div>
		</div>
	);
}

function DiagnosticPanel({ diagnostics }: { diagnostics: Diagnostic[] }) {
	if (diagnostics.length === 0) {
		return <div className="diag ok">OK — sprite compiled.</div>;
	}
	return (
		<ul className="diag err">
			{diagnostics.map((d) => (
				<li key={`${d.code}-${d.loc.line}-${d.loc.col}-${d.message}`}>
					{formatDiagnosticLine(d)}
				</li>
			))}
		</ul>
	);
}
