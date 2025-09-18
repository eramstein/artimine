import { cards, lands } from '@/data';
import type { CardTemplate, Character, Item } from '../_model';
import { CardRarity, CardSet } from '../_model/enums-battle';
import { ItemType } from '../_model/enums-sim';
import { gs } from '../_state/main.svelte';
import { getRandomFromArray } from '../_utils/random';
import { addCardToCollection } from './collection';

function generateBooster(cardSet: CardSet): CardTemplate[] {
  const setCards = Object.values(cards).filter((card) => card.cardSet === cardSet);
  const rares = setCards.filter((card) => card.rarity === CardRarity.Rare);
  const uncommons = setCards.filter((card) => card.rarity === CardRarity.Uncommon);
  const commons = setCards.filter((card) => card.rarity === CardRarity.Common);
  const boosterPack: CardTemplate[] = [];
  // 1 rare, 3 uncommons, 11 commons
  boosterPack.push(getRandomFromArray(rares));
  for (let i = 0; i < 3; i++) {
    boosterPack.push(getRandomFromArray(uncommons));
  }
  for (let i = 0; i < 11; i++) {
    boosterPack.push(getRandomFromArray(commons));
  }
  return boosterPack;
}

function generateStarterDeck(cardSet: CardSet): CardTemplate[] {
  const setCards = Object.values(cards).filter((card) => card.cardSet === cardSet);
  const rares = setCards.filter((card) => card.rarity === CardRarity.Rare);
  const uncommons = setCards.filter((card) => card.rarity === CardRarity.Uncommon);
  const commons = setCards.filter((card) => card.rarity === CardRarity.Common);
  const starterDeck: CardTemplate[] = [];
  // 3 rare, 9 uncommons, 30 commons
  for (let i = 0; i < 3; i++) {
    starterDeck.push(getRandomFromArray(rares));
  }
  for (let i = 0; i < 9; i++) {
    starterDeck.push(getRandomFromArray(uncommons));
  }
  for (let i = 0; i < 30; i++) {
    starterDeck.push(getRandomFromArray(commons));
  }
  // basic and staple lands
  starterDeck.push(lands['mountain']);
  starterDeck.push(lands['forest']);
  starterDeck.push(lands['island']);
  starterDeck.push(lands['city']);
  starterDeck.push(lands['market']);
  starterDeck.push(lands['plains']);
  return starterDeck;
}

export function openCardPack(item: Item): CardTemplate[] {
  const pack =
    item.type === ItemType.Booster
      ? generateBooster(item.variant as CardSet)
      : generateStarterDeck(item.variant as CardSet);
  console.log('openCardPack', pack);

  // Add cards to collection
  pack.forEach((card) => {
    addCardToCollection(card.id, gs.player);
  });

  // Remove the pack from inventory
  const itemIndex = gs.player.items.findIndex((i) => i.instanceId === item.instanceId);
  if (itemIndex !== -1) {
    gs.player.items.splice(itemIndex, 1);
  }

  return pack;
}

export function openBoosterForCharacter(character: Character, cardSet: CardSet) {
  const boosterPack = generateBooster(cardSet);
  boosterPack.forEach((card) => {
    addCardToCollection(card.id, character);
  });
}

export function openStarterDeckForCharacter(character: Character, cardSet: CardSet) {
  const starterDeck = generateStarterDeck(cardSet);
  starterDeck.forEach((card) => {
    addCardToCollection(card.id, character);
  });
}
