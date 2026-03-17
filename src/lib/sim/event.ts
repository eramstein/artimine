import { gs } from '../_state';
import { generateEventWithLLM, resolveEventWithLLM } from '../llm/event';
import { difficultyNumbers } from './actions/general-challenge';
import { checkActionSuccess } from './roll';

export function createEventForCurrentActivity() {
  generateEventWithLLM();
}

export function setEventOutcome(optionIndex: number) {
  const optionDescription = gs.activity.event!.options[optionIndex].description;
  const difficulty =
    difficultyNumbers[gs.activity.event!.options[optionIndex].difficulty] ??
    difficultyNumbers.medium;
  const outcome = checkActionSuccess(
    gs.activity.event!.options[optionIndex].relatedAttribute,
    difficulty
  );
  resolveEventWithLLM(optionDescription, outcome.success, outcome.isCritical);
}
