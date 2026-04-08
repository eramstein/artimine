import { cards } from '@/data';
import { config } from '../../_config';
import type { Card } from '../../_model';
import type { RelationValues } from '../../_model/model-game';
import { bs, gs } from '../../_state';
import { makeUnit, summonUnit } from '../../battle/unit';

export interface CommandResult {
  ok: boolean;
  message: string;
}

export function executeCommand(input: string): CommandResult {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) {
    return { ok: false, message: 'Commands must start with /' };
  }

  const parts = trimmed.slice(1).split(/\s+/);
  const cmd = parts[0];

  switch (cmd) {
    case 'npc-rel': {
      // /npc-rel <npcKey> <relationKey> <value>
      const [, npcKey, relationKey, valueStr] = parts;
      if (!npcKey || !relationKey || valueStr === undefined) {
        return { ok: false, message: 'Usage: /npc-rel <npcKey> <relationKey> <value>' };
      }

      const npc = gs.characters[npcKey];
      if (!npc) {
        return { ok: false, message: `Unknown NPC: ${npcKey}` };
      }

      const validKeys: (keyof RelationValues)[] = ['friendship', 'love', 'respect'];
      if (!validKeys.includes(relationKey as keyof RelationValues)) {
        return {
          ok: false,
          message: `Invalid relation key: ${relationKey}. Valid: ${validKeys.join(', ')}`,
        };
      }

      const value = Number(valueStr);
      if (isNaN(value)) {
        return { ok: false, message: `Invalid value: ${valueStr}` };
      }

      npc.relationValues[relationKey as keyof RelationValues] = value;
      return { ok: true, message: `Set ${npcKey}.relationValues.${relationKey} = ${value}` };
    }

    case 'get-card': {
      // /get-card <cardKey> [playerIndex]
      const [, cardKey, playerIndexStr] = parts;
      if (!cardKey) {
        return { ok: false, message: 'Usage: /get-card <cardKey> [playerIndex]' };
      }

      const cardTemplate = cards[cardKey];
      if (!cardTemplate) {
        return { ok: false, message: `Unknown card: ${cardKey}` };
      }

      const playerIndex = playerIndexStr === '1' || playerIndexStr === 'opponent' ? 1 : 0;

      if (!bs.players?.[playerIndex]) {
        return { ok: false, message: 'No active battle' };
      }

      const card: Card = {
        ...cardTemplate,
        ownerPlayerId: playerIndex,
        instanceId: crypto.randomUUID(),
        cost: 0,
        colors: [],
      } as Card;

      bs.players[playerIndex].hand.push(card);
      return {
        ok: true,
        message: `Added ${cardTemplate.name} to ${playerIndex === 1 ? "opponent's " : ''}hand`,
      };
    }

    case 'discard-hand': {
      // /discard-hand
      bs.players[1].hand = [];
      return { ok: true, message: `Discarded opponent's hand` };
    }

    case 'gold': {
      // /gold <amount>
      const [, amountStr] = parts;
      if (amountStr === undefined) {
        return { ok: false, message: 'Usage: /gold <amount>' };
      }

      const amount = Number(amountStr);
      if (isNaN(amount)) {
        return { ok: false, message: `Invalid amount: ${amountStr}` };
      }

      const player = bs.players?.[0];
      if (!player) {
        return { ok: false, message: 'No active battle player' };
      }

      player.gold = amount;
      return { ok: true, message: `Set player gold to ${amount}` };
    }

    case 'spawn': {
      // /spawn <cardKey> <row-column>
      const [, cardKey, posStr] = parts;
      if (!cardKey || !posStr) {
        return { ok: false, message: 'Usage: /spawn <cardKey> <row-column>' };
      }

      const cardTemplate = cards[cardKey];
      if (!cardTemplate) {
        return { ok: false, message: `Unknown card: ${cardKey}` };
      }

      const [rowStr, colStr] = posStr.split('-');
      const row = Number(rowStr);
      const column = Number(colStr);
      if (isNaN(row) || isNaN(column)) {
        return {
          ok: false,
          message: `Invalid position: ${posStr}. Expected format: row-column (e.g. 2-1)`,
        };
      }

      const position = { row, column };
      const ownerPlayerId = column < config.boardColumns / 2 ? 0 : 1;

      if (!bs.players?.[ownerPlayerId]) {
        return { ok: false, message: 'No active battle' };
      }

      const unit = makeUnit(ownerPlayerId, cardTemplate as Parameters<typeof makeUnit>[1]);
      summonUnit(unit, position);
      return { ok: true, message: `Spawned ${cardTemplate.name} at row ${row}, col ${column}` };
    }

    default:
      return { ok: false, message: `Unknown command: ${cmd}` };
  }
}
