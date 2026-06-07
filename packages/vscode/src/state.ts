let selectedSprite: string | undefined;

export function getSelectedSprite(): string | undefined {
	return selectedSprite;
}

export function setSelectedSprite(name: string | undefined): void {
	selectedSprite = name;
}
