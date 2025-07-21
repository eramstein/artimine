import type { Player, UnitDeployed } from '../_model';
import { bs } from '../_state';
import { clearSelections } from '../ui/_helpers/selections';
import { playAiTurn } from './ai/ai';
import { drawCard } from './deck';
import { damageUnit, healUnit } from './unit';
import { onTurnStart } from './listeners';

export function nextTurn() {
  console.log('next turn', bs.turn, bs.isPlayersTurn);
  clearSelections();
  bs.turn++;
  bs.isPlayersTurn = !bs.isPlayersTurn;
  const player = bs.isPlayersTurn ? bs.players[0] : bs.players[1];
  initPlayerTurn(player);
  onTurnStart(player);
  console.log('isPlayersTurn', bs.isPlayersTurn);
  if (!bs.isPlayersTurn) {
    playAiTurn();
  }
}

function initPlayerTurn(player: Player) {
  player.maxMana++;
  player.mana = player.maxMana;
  player.abilityUsed = false;
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
      statuses(unit);
      hotAndDot(unit);
    });
}

function hotAndDot(unit: UnitDeployed) {
  let hpChange = (unit.keywords?.regeneration || 0) - (unit.statuses.poison || 0);
  if (hpChange < 0) {
    damageUnit(unit, -hpChange);
  }
  if (hpChange > 0) {
    healUnit(unit, hpChange);
  }
}

function statuses(unit: UnitDeployed) {
  if (unit.statuses.mezz && unit.statuses.mezz > 0) {
    unit.statuses.mezz--;
  }
  if (unit.statuses.stun && unit.statuses.stun > 0) {
    unit.statuses.stun--;
  }
  if (unit.statuses.root && unit.statuses.root > 0) {
    unit.statuses.root--;
  }
}
