import { cards } from '@/data';
import type { CardTemplate, Character, Item } from '../_model';
import { CardRarity, CardSet } from '../_model/enums-battle';
import { gs } from '../_state/main.svelte';
import { getRandomFromArray } from '../_utils/random';
import { addCardToCollection } from './collection';

function generateBooster(cardSet: CardSet): CardTemplate[] {
  const setCards = Object.values(cards).filter((card) => card.cardSet === cardSet);
  const rares = setCards.filter((card) => card.rarity === CardRarity.Rare);
  const uncommons = setCards.filter((card) => card.rarity === CardRarity.Uncommon);
  const commons = setCards.filter((card) => card.rarity === CardRarity.Common);
  const boosterPack: CardTemplate[] = [];
  // 1 rare, 2 uncommons, 4 commons
  boosterPack.push(getRandomFromArray(rares));
  for (let i = 0; i < 2; i++) {
    boosterPack.push(getRandomFromArray(uncommons));
  }
  for (let i = 0; i < 4; i++) {
    boosterPack.push(getRandomFromArray(commons));
  }
  return boosterPack;
}

export function openBooster(item: Item): CardTemplate[] {
  const boosterPack = generateBooster(item.variant as CardSet);

  // Add cards to collection
  boosterPack.forEach((card) => {
    addCardToCollection(card.id, gs.player);
  });

  // Remove the booster from inventory
  const itemIndex = gs.player.items.findIndex((i) => i.instanceId === item.instanceId);
  if (itemIndex !== -1) {
    gs.player.items.splice(itemIndex, 1);
  }

  return boosterPack;
}

export function openBoosterForCharacter(character: Character, cardSet: CardSet) {
  const boosterPack = generateBooster(cardSet);
  boosterPack.forEach((card) => {
    addCardToCollection(card.id, character);
  });
}
