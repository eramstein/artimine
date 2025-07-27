import { cards } from '@/data';
import {
  isSpellCard,
  isUnitCard,
  type BattleState,
  type GameState,
  type SpellCardTemplate,
  type UnitCardTemplate,
} from '../_model';

const LOCAL_STORAGE_KEY = 'artimineState';
const LOCAL_STORAGE_KEY_BATTLE = 'artimineBattleState';

const defaultBattleState: BattleState = {
  turn: 0,
  isPlayersTurn: true,
  playerIdWon: null,
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
    restoreBattleFunctions(parsedBattleState);
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

function restoreBattleFunctions(bs: BattleState) {
  if (!bs) {
    return;
  }
  bs.units.forEach((unit) => {
    restoreUnitFunctions(unit);
  });
  bs.players.forEach((player) => {
    player.hand.forEach((unit) => {
      if (isUnitCard(unit)) {
        restoreUnitFunctions(unit);
      }
    });
    player.deck.forEach((unit) => {
      if (isUnitCard(unit)) {
        restoreUnitFunctions(unit);
      }
    });
    player.graveyard.forEach((unit) => {
      if (isUnitCard(unit)) {
        restoreUnitFunctions(unit);
      }
    });
    player.hand.forEach((spell) => {
      if (isSpellCard(spell)) {
        restoreSpellFunctions(spell);
      }
    });
    player.deck.forEach((spell) => {
      if (isSpellCard(spell)) {
        restoreSpellFunctions(spell);
      }
    });
    player.graveyard.forEach((spell) => {
      if (isSpellCard(spell)) {
        restoreSpellFunctions(spell);
      }
    });
  });
}

export function restoreUnitFunctions(unit: UnitCardTemplate) {
  unit.abilities = (cards[unit.id] as UnitCardTemplate).abilities;
}

export function restoreSpellFunctions(spell: SpellCardTemplate) {
  spell.effect = (cards[spell.id] as SpellCardTemplate).effect;
  spell.targets = (cards[spell.id] as SpellCardTemplate).targets;
}
