import { TargetType } from '@/lib/_model/enums';
import type { Target } from '@/lib/_model/model-battle';

export const DataTargetTemplates: {
  [key: string]: (...any: any) => Target;
} = {
  ennemies: (n: number) => ({
    type: TargetType.Foe,
    count: n,
  }),
  cell: () => ({
    type: TargetType.EmptyCell,
    count: 1,
  }),
  allyCell: () => ({
    type: TargetType.EmptyAllyCell,
    count: 1,
  }),
};
