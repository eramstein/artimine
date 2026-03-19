import { cards } from '@/data';
import type { Card } from '../../_model';
import { bs, gs } from '../../_state';
import type { RelationValues } from '../../_model/model-game';

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
        return { ok: false, message: `Invalid relation key: ${relationKey}. Valid: ${validKeys.join(', ')}` };
      }

      const value = Number(valueStr);
      if (isNaN(value)) {
        return { ok: false, message: `Invalid value: ${valueStr}` };
      }

      npc.relationValues[relationKey as keyof RelationValues] = value;
      return { ok: true, message: `Set ${npcKey}.relationValues.${relationKey} = ${value}` };
    }

    case 'get-card': {
      // /get-card <cardKey>
      const [, cardKey] = parts;
      if (!cardKey) {
        return { ok: false, message: 'Usage: /get-card <cardKey>' };
      }

      const cardTemplate = cards[cardKey];
      if (!cardTemplate) {
        return { ok: false, message: `Unknown card: ${cardKey}` };
      }

      if (!bs.players?.[0]) {
        return { ok: false, message: 'No active battle' };
      }

      const card: Card = {
        ...cardTemplate,
        ownerPlayerId: 0,
        instanceId: crypto.randomUUID(),
      } as Card;

      bs.players[0].hand.push(card);
      return { ok: true, message: `Added ${cardTemplate.name} to hand` };
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

    default:
      return { ok: false, message: `Unknown command: ${cmd}` };
  }
}
