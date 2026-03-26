import { PersonaType } from '../model';
import { AiPersonaAggro } from './aggro';
import { AiPersonaNormal } from './normal';

export const AiPersonaToType = {
  [PersonaType.Aggro]: AiPersonaAggro,
  [PersonaType.Normal]: AiPersonaNormal,
};
