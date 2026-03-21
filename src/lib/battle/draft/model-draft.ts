import type { CardColor } from '../../_model/enums-battle';

export interface DraftState {
  packNumber: number; // 0, 1, 2
  direction: 1 | -1; // 1 (left), -1 (right)
  activeBoosters: Record<string, string[]>; // playerKey -> cardIds in the current pack they are holding
  draftedCards: Record<string, string[]>; // playerKey -> cardIds drafted so far
  botsColors: Record<string, CardColor[]>; // assigned colors for AI players
}
