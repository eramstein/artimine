import { bs } from '../_state';

export function discard(cardInstanceId: string, playerId: number) {
  const card = bs.players[playerId].hand.find((c) => c.instanceId === cardInstanceId);
  if (!card) return;
  bs.players[playerId].hand = bs.players[playerId].hand.filter(
    (c) => c.instanceId !== cardInstanceId
  );
  bs.players[playerId].graveyard.push(card);
}
