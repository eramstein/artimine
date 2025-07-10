import type { BattleState, GameState } from '../_model';

const LOCAL_STORAGE_KEY = 'artimineState';
const LOCAL_STORAGE_KEY_BATTLE = 'artimineBattleState';

const defaultBattleState: BattleState = {
  turn: 0,
  isPlayersTurn: true,
  players: [],
  units: [],
};

export const gs: GameState = $state({});
export const bs: BattleState = $state(defaultBattleState);

export const saveStateToLocalStorage = (): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gs));
    localStorage.setItem(LOCAL_STORAGE_KEY_BATTLE, JSON.stringify(bs));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

export const loadGameStateFromLocalStorage = async () => {
  try {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedState) return {};

    const parsedState: GameState = JSON.parse(savedState);
    // Update the current state with the loaded data in a way that triggers reactivity
    Object.assign(gs, parsedState);

    const savedBattleState = localStorage.getItem(LOCAL_STORAGE_KEY_BATTLE);
    if (!savedBattleState) return {};

    const parsedBattleState: BattleState = JSON.parse(savedBattleState);
    Object.assign(bs, parsedBattleState);
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
};
