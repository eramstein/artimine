import { AiTurnStrategy } from '@/lib/_model';
import { PersonaType } from './model';
import { valueBoard } from './valuations/unit';

/*
The strategy is evaluated at the start of the turn
It sets a general stance depending on the board state
*/
export function getAiStrategy(persona: PersonaType): AiTurnStrategy {
  if (persona === PersonaType.Aggro) {
    return AiTurnStrategy.Attack;
  }
  const boardControl = valueBoard().rel;
  if (boardControl < 0.3) {
    return AiTurnStrategy.Defend;
  }
  if (boardControl > 0.7) {
    return AiTurnStrategy.Attack;
  }
  return AiTurnStrategy.Normal;
}
