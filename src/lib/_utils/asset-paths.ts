// Utility function to get the correct asset path for both development and production
export function getAssetPath(path: string): string {
  // In development, Vite serves assets from the src directory
  // In production, assets are processed and served from the base path
  if (import.meta.env.DEV) {
    return `/src/assets/${path}`;
  } else {
    return `/artimine/assets/${path}`;
  }
}

// Specific asset path helpers
export function getCardImagePath(cardId: string): string {
  return getAssetPath(`images/cards/${cardId}.jpg`);
}

export function getLandImagePath(landId: string): string {
  return getAssetPath(`images/lands/${landId}.jpg`);
}

export function getCharacterImagePath(characterName: string): string {
  return getAssetPath(`images/characters/${characterName}.jpg`);
}

export function getSoundPath(soundName: string): string {
  return getAssetPath(`sounds/battle/${soundName}.mp3`);
}

export function getTableImagePath(): string {
  return getAssetPath('images/table.jpg');
}

export function getCardBackImagePath(): string {
  return getAssetPath('images/card_back.jpg');
}
