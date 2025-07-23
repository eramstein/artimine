import { bs } from '../_state';
import type { Card } from '../_model';

export function getAllGraveyardsCards(): Card[] {
  return bs.players.flatMap((p) => p.graveyard);
}
