import { config } from '../_config';
import { type Npc, type RelationValues } from '../_model';
import { clamp } from '../_utils/random';

export function updateNpcRelationValue(npc: Npc, relation: keyof RelationValues, value: number) {
  npc.relationValues[relation] = clamp(
    npc.relationValues[relation] + value,
    -config.opinionMaxValue,
    config.opinionMaxValue
  );
}
