import { cards } from "@/data";
import type { Card, CardTemplate, Player } from "../_model/model-battle";
import { bs } from "../_state/main.svelte";
import { getRandomFromArray } from "../_utils/random";

const shopCardsList = [
  { cost: 1, template: 'wooden_barricade' },
  { cost: 2, template: 'neutralize' },
  { cost: 3, template: 'rebuild' },
  { cost: 4, template: 'heal' },
  { cost: 5, template: 'the_great_reset' },
];

export function rollShopCards() {
  const shopCards = [];
  for (let i = 0; i < 5; i++) {
    shopCards.push(getRandomFromArray(shopCardsList));
  }
  bs.shop.cards = shopCards.map((c) => ({ cost: c.cost, template: cards[c.template] })) ;
}

export function buyShopCard(player: Player, card: { cost: number; template: CardTemplate }): Card | undefined {
  if (player.gold >= card.cost) {
    player.gold -= card.cost;
    const newCard = {
      ...card.template,
      ownerPlayerId: player.id,
      instanceId: crypto.randomUUID(),
    } as Card;
    player.hand.push(newCard);
    bs.shop.cards = bs.shop.cards.filter((c) => c.template !== card.template);
    return newCard;
  } else {
    console.log('Not enough gold to buy card');
    return undefined;
  }
}