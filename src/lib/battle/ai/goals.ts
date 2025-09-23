import { AiTurnGoal } from '@/lib/_model';
import { PersonaType } from './model';
import { baordWipeThreshold } from './valuations/config';
import { valueBoard } from './valuations/unit';

/*
Goals are specific actions to take to achieve the current strategy
*/
export function getAiGoals(persona: PersonaType): { goal: AiTurnGoal; args: any }[] {
  if (persona === PersonaType.Aggro) {
    return [];
  }
  const boardValueDiff = valueBoard();
  console.log('boardValueDiff', boardValueDiff, baordWipeThreshold);
  if (boardValueDiff <= -baordWipeThreshold) {
    return [{ goal: AiTurnGoal.Reset, args: {} }];
  }
  return [];
}
