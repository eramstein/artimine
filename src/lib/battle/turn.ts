import type { Player, UnitCardDeployed } from '../_model';
import { bs } from '../_state';
import { clearSelections } from '../ui/_helpers/selections';
import { playAiTurn } from './ai/ai';
import { drawCard } from './deck';
import { damageUnit, healUnit } from './unit';

export function nextTurn() {
  console.log('next turn');
  clearSelections();
  bs.turn++;
  bs.isPlayersTurn = !bs.isPlayersTurn;
  const player = bs.isPlayersTurn ? bs.players[0] : bs.players[1];
  initPlayerTurn(player);
  console.log('isPlayersTurn', bs.isPlayersTurn);
  if (!bs.isPlayersTurn) {
    playAiTurn();
  }
}

function initPlayerTurn(player: Player) {
  player.maxMana++;
  player.mana = player.maxMana;
  updateUnits(player);
  drawCard(player);
}

function updateUnits(player: Player) {
  bs.units
    .filter((unit) => unit.ownerPlayerId === player.id)
    .forEach((unit) => {
      unit.hasAttacked = false;
      unit.hasMoved = false;
      unit.exhausted = false;
      hotAndDot(unit);
    });
}

function hotAndDot(unit: UnitCardDeployed) {
  let hpChange = (unit.keywords?.regeneration || 0) - (unit.statuses.poison || 0);
  if (hpChange < 0) {
    damageUnit(unit, -hpChange);
  }
  if (hpChange > 0) {
    healUnit(unit, hpChange);
  }
}
