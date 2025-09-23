import { AiTurnStrategy } from '@/lib/_model';
import { PersonaType } from './model';

/*
The strategy is evaluated at the start of the turn
It sets a general stance depending on the board state
*/
export function getAiStrategy(persona: PersonaType): AiTurnStrategy {
  if (persona === PersonaType.Aggro) {
    return AiTurnStrategy.Attack;
  }
  // TODO: assess board state and set strategy
  return AiTurnStrategy.Normal;
}
