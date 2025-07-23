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
      DataAbilityTemplates.summon(
        { name: 'Shroomy Shooty', cost: 1, exhausts: true },
        { summonedUnit: 'shroomy_shooty' }
      ),
      DataAbilityTemplates.summon(
        { name: 'Shroomy Protecs', cost: 1, exhausts: true },
        { summonedUnit: 'shroomy_protecs' }
      ),
      DataAbilityTemplates.summon(
        { name: 'Shroomy Rooty', cost: 1, exhausts: true },
        { summonedUnit: 'shroomy_rooty' }
      ),
    ],
  },
};
