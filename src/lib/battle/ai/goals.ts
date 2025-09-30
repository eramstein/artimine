import { AiTurnGoal } from '@/lib/_model';
import { bs } from '@/lib/_state';
import { PersonaType } from './model';
import { lookForLethalRow } from './rows';
import { baordWipeThreshold } from './valuations/config';
import { valueBoard } from './valuations/unit';

/*
Goals are specific actions to take to achieve the current strategy
*/
export function getAiGoals(persona: PersonaType): { goal: AiTurnGoal; args: any }[] {
  if (persona === PersonaType.Aggro) {
    return [];
  }
  // 1st priority: look for a lethal row
  const lethalRow = lookForLethalRow();
  if (lethalRow !== null) {
    const goals: { goal: AiTurnGoal; args: any }[] = [
      { goal: AiTurnGoal.BreachRow, args: { row: lethalRow } },
    ];
    const blockers = bs.units.filter((u) => u.position.row === lethalRow && u.ownerPlayerId === 0);
    blockers.forEach((blocker) => {
      goals.push({ goal: AiTurnGoal.RemoveUnit, args: { unit: blocker } });
    });
    return goals;
  }

  // check if we need to reset the board
  const boardValueDiff = valueBoard();
  if (boardValueDiff <= -baordWipeThreshold) {
    return [{ goal: AiTurnGoal.Reset, args: {} }];
  }
  return [];
}
