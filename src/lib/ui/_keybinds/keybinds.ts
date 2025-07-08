import { loadGameStateFromLocalStorage, saveStateToLocalStorage, gs } from '../../_state';

export function handleKeybinds(event: KeyboardEvent) {
  // Skip keybinds if user is typing in an input field
  const target = event.target as HTMLElement;
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]'))
  ) {
    return;
  }

  if (event.key === 'F4') {
    event.preventDefault();
    const loadedState = loadGameStateFromLocalStorage();
    console.log('State reloaded from localStorage', loadedState);
  } else if (event.key === 'F5') {
    event.preventDefault();
    saveStateToLocalStorage();
    console.log('State saved to localStorage');
  }
}
