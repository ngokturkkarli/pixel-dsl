export function resolveScale(
	value: number | undefined,
	defaultValue = 16,
): number {
	return Math.max(1, value ?? defaultValue);
}

/** Preview compile scale — defaults lower than build scale for responsiveness. */
export function resolvePreviewScale(
	previewScale: number | undefined,
	buildScale: number,
): number {
	if (previewScale !== undefined && previewScale > 0) return previewScale;
	return Math.min(buildScale, 8);
}

export function resolveOutputDirectory(
	configured: string,
	fallbackDir: string,
): string {
	const trimmed = configured.trim();
	return trimmed || fallbackDir;
}

export function resolveDefaultSpriteName(value: string): string | undefined {
	return value === "first" ? undefined : value;
}
