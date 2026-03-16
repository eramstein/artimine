import { gs } from '../_state';
import { generateEventWithLLM, resolveEventWithLLM } from '../llm/event';
import { checkActionSuccess } from './roll';

export function createEventForCurrentActivity() {
  generateEventWithLLM();
}

export function setEventOutcome(optionIndex: number) {
  const optionDescription = gs.activity.event!.options[optionIndex].description;
  const outcome = checkActionSuccess(
    gs.activity.event!.options[optionIndex].relatedAttribute,
    gs.activity.event!.options[optionIndex].difficulty
  );
  resolveEventWithLLM(optionDescription, outcome.success, outcome.isCritical);
}
