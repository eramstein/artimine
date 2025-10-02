import { cards } from '@/data';
import { config } from '../_config';
import { CardRarity } from '../_model/enums-battle';
import type { CardTuple, Character, Npc } from '../_model/model-game';
import { gs } from '../_state';
import { sendTradeEvent } from '../llm/trade-events';

export function proposeTrade(character: Npc, offers: CardTuple[], wants: CardTuple[]): boolean {
  if (character.period.trades >= getMaxTradesPerPeriod(character)) {
    return false;
  }
  let accepted = false;
  const offerValue = evaluateCardTuple(offers, character);
  const wantValue = evaluateCardTuple(wants, character);
  accepted = offerValue >= wantValue;
  if (accepted) {
    performTrade(character, offers, wants);
  }
  const offerCards = offers.map((o) => cards[o.cardTemplateId].name).join(' and ');
  const wantCards = wants.map((w) => cards[w.cardTemplateId].name).join(' and ');
  sendTradeEvent(
    `${gs.player.name} proposed to trade his ${offerCards} to ${character.name} in exchange of ${wantCards}.`,
    accepted
  );
  return accepted;
}

function performTrade(character: Npc, offers: CardTuple[], wants: CardTuple[]): void {
  mergeIntoCollection(character.collection, offers);
  removeFromCollection(character.collection, wants);
  character.period.trades++;
}

function mergeIntoCollection(collection: CardTuple[], tuples: CardTuple[]): void {
  for (const tuple of tuples) {
    const existing = collection.find((c) => c.cardTemplateId === tuple.cardTemplateId);
    if (existing) {
      existing.count += tuple.count;
    } else {
      collection.push(tuple);
    }
  }
}

function removeFromCollection(collection: CardTuple[], tuples: CardTuple[]): void {
  for (const tuple of tuples) {
    const existing = collection.find((c) => c.cardTemplateId === tuple.cardTemplateId);
    if (existing) {
      existing.count -= tuple.count;
    }
    if (existing && existing.count <= 0) {
      collection.splice(collection.indexOf(existing), 1);
    }
  }
}

function evaluateCardTuple(tuples: CardTuple[], character: Character): number {
  let value = 0;
  for (const card of tuples) {
    const cardTemplate = cards[card.cardTemplateId];
    if (cardTemplate.rarity === CardRarity.Common) {
      value += card.count;
    } else if (cardTemplate.rarity === CardRarity.Uncommon) {
      value += card.count * 10;
    } else if (cardTemplate.rarity === CardRarity.Rare) {
      value += card.count * 100;
    } else if (cardTemplate.rarity === CardRarity.Legendary) {
      value += card.count * 10000;
    }
  }
  return value;
}

export function getMaxTradesPerPeriod(character: Npc): number {
  return Math.max(
    0,
    config.maxTradesPerPeriod + Math.floor(character.relationValues.friendship / 4)
  );
}
