import type { ItemDefinition } from '../_model';
import { gs } from '../_state';

export function buyItem(item: ItemDefinition) {
  if (gs.player.cash >= item.price) {
    gs.player.cash -= item.price;
    gs.player.items.push(instantiateItem(item, gs.player.key));
  } else {
    console.log('Not enough cash to buy item');
  }
}

function instantiateItem(item: ItemDefinition, ownerId: string) {
  return {
    instanceId: crypto.randomUUID(),
    ownerId,
    ...item,
  };
}
