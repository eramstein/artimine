import { config } from '../_config';
import { NpcPerk, type Npc, type RelationValues } from '../_model';
import { clamp } from '../_utils/random';

export function updateNpcRelationValue(npc: Npc, relation: keyof RelationValues, value: number) {
  npc.relationValues[relation] = clamp(
    npc.relationValues[relation] + value,
    -config.opinionMaxValue,
    config.opinionMaxValue
  );
  if (relation === 'friendship' && value > 0) {
    npc.perks[NpcPerk.ExtraTrade] = (npc.perks[NpcPerk.ExtraTrade] || 0) + 1;
  }
}
