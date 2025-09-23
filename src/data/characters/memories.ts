import type { GroupActivityLog } from '@/lib/_model';
import { CHARACTER_EMMA_MEMORIES } from './emma';
import { CHARACTER_HENRY_MEMORIES } from './henry';
import { CHARACTER_MOLLY_MEMORIES } from './molly';
import { CHARACTER_OUSMANE_MEMORIES } from './ousmane';
import { CHARACTER_THE_DUDE_MEMORIES } from './the-dude';

export const CHARACTER_INITIAL_MEMORIES: Omit<GroupActivityLog, 'id' | 'embedding'>[] = [
  ...CHARACTER_THE_DUDE_MEMORIES,
  ...CHARACTER_EMMA_MEMORIES,
  ...CHARACTER_HENRY_MEMORIES,
  ...CHARACTER_MOLLY_MEMORIES,
  ...CHARACTER_OUSMANE_MEMORIES,
];
