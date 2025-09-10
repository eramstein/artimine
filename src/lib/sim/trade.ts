import { cards } from '@/data';
import { CardRarity } from '../_model/enums-battle';
import type { CardTuple, Character } from '../_model/model-game';

export function proposeTrade(
  character: Character,
  offers: CardTuple[],
  wants: CardTuple[]
): boolean {
  let accepted = false;
  const offerValue = evaluateCardTuple(offers, character);
  const wantValue = evaluateCardTuple(wants, character);
  accepted = offerValue >= wantValue;
  if (accepted) {
    performTrade(character, offers, wants);
  }
  return accepted;
}

function performTrade(character: Character, offers: CardTuple[], wants: CardTuple[]): void {
  mergeIntoCollection(character.collection, offers);
  removeFromCollection(character.collection, wants);
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
