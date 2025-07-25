import { CardColor, CardType, StatusType, type CardTemplate } from '@/lib/_model';
import { DataAbilityTemplates, DataTriggerTemplates, SpellTemplates } from '@/lib/battle/abilities';
import { DataEffectTemplates } from '@/lib/battle/effects';
import { DataTargetTemplates } from '@/lib/battle/target';

export const cards_GB: Record<string, CardTemplate> = {
  ebonheart: {
    id: 'ebonheart',
    name: 'Ebonheart',
    type: CardType.Unit,
    cost: 5,
    power: 0,
    maxHealth: 1,
    colors: [
      { color: CardColor.Green, count: 2 },
      { color: CardColor.Black, count: 1 },
    ],
    abilities: [
      DataAbilityTemplates.summon({ summonedUnit: 'shroomy_shooty', cost: 1 }),
      DataAbilityTemplates.summon({ summonedUnit: 'shroomy_protecs', cost: 1 }),
      DataAbilityTemplates.summon({ summonedUnit: 'shroomy_rooty', cost: 1 }),
    ],
  },
  mycosed_bear: {
    id: 'mycosed_bear',
    name: 'Mycosed Bear',
    type: CardType.Unit,
    cost: 3,
    power: 2,
    maxHealth: 1,
    colors: [
      { color: CardColor.Green, count: 1 },
      { color: CardColor.Black, count: 1 },
    ],
    abilities: [DataAbilityTemplates.respawnAs({ summonedUnit: 'shroomy_shooty' })],
  },
};
