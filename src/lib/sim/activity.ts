import { ActivityType } from '../_model/enums-sim';
import type { Activity } from '../_model/model-game';
import { gs } from '../_state/main.svelte';

export function autoResolveActivity(activity: Activity) {
  switch (activity.activityType) {
    case ActivityType.Chill:
      break;
    case ActivityType.Gaming:
      break;
    case ActivityType.Work:
      break;
    case ActivityType.Study:
      gs.player.studyPoints += 1;
      break;
  }
}
