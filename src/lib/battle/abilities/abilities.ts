import type { Ability } from '@/lib/_model/model-battle';
import { DataAbilityTemplates as AT } from './abilityTemplates';

export const DataAbilities: { [key: string]: Ability } = {
  cleave: AT.cleave({ name: 'Cleave' }, { damage: 1 }),
  healAdjacentOnMove: AT.healAdjacentOnMove({ name: 'Heal On Move' }, { healValue: 1 }),
  buffAdjacentOnMove: AT.buffAdjacentOnMove({ name: 'Buff On Move' }, { attackValue: 1 }),
};
