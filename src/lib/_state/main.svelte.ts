import { type BattleState, type GameState } from '../_model';
import { defaultBattleState } from '../battle';
import { defaultGameState, initSim } from '../sim/init';

const LOCAL_STORAGE_KEY = 'artimineState';
const LOCAL_STORAGE_KEY_BATTLE = 'artimineBattleState';

export const gs: GameState = $state(defaultGameState);
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
    if (savedState) {
      const parsedState: GameState = JSON.parse(savedState);
      Object.assign(gs, parsedState);
    } else {
      initSim();
    }

    const savedBattleState = localStorage.getItem(LOCAL_STORAGE_KEY_BATTLE);
    if (!savedBattleState) return {};

    const parsedBattleState: BattleState = JSON.parse(savedBattleState);
    Object.assign(bs, parsedBattleState);
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
};

export const resetBattleState = (): void => {
  try {
    // Reset to default battle state
    Object.assign(bs, defaultBattleState);
    // Save the reset state to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY_BATTLE, JSON.stringify(bs));
  } catch (error) {
    console.error('Failed to reset battle state:', error);
  }
};

export const getCurrentBattleState = () => {
  return JSON.parse(JSON.stringify({ ...bs }));
};
