import { gs } from '../_state/main.svelte';

export function getKeysFromNames(names: string[]) {
  return names
    .map((name) => Object.values(gs.characters).find((c) => c.name === name)?.key)
    .filter((p) => p !== undefined);
}

export function getCharactersFromNames(names: string[]) {
  return names
    .map((name) => Object.values(gs.characters).find((c) => c.name === name))
    .filter((p) => p !== undefined);
}
