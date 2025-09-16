import { cards } from '@/data';
import type {
  UnitCardTemplate,
  UnitDeployed,
  UnitKeywordDefinition,
} from '@/lib/_model/model-battle';
import { bs } from '../_state';

// removes static abilities originating from a unit
export function clearUnitStaticAbilities(unit: UnitDeployed, sourceEffectName?: string) {
  bs.units.forEach((targetUnit) => {
    targetUnit.staticModifiers
      .filter((sm) => sm.source.unitId === unit.instanceId && !sm.permanent)
      .forEach((sm) => {
        if (sm.keyword) {
          removeStaticKeyword(targetUnit, sourceEffectName, unit);
        }
      });
  });
}

export function removeStaticKeyword(
  targetUnit: UnitDeployed,
  sourceEffectName?: string,
  sourceUnit?: UnitDeployed
) {
  // adjust unit keywords
  targetUnit.staticModifiers
    .filter(
      (sm) =>
        sm.keyword &&
        (!sourceUnit || sm.source.unitId === sourceUnit.instanceId) &&
        (!sourceEffectName || sm.source.effectName === sourceEffectName)
    )
    .forEach((sm) => {
      const { key, value } = sm.keyword as UnitKeywordDefinition;
      if (typeof value === 'number' && targetUnit.keywords?.[key]) {
        (targetUnit.keywords[key] as number) -= value;
      } else {
        let hadItAlready = false;
        if ((cards[targetUnit.instanceId] as UnitCardTemplate)?.keywords?.[key]) {
          hadItAlready = true;
        } else {
          targetUnit.staticModifiers.forEach((sm) => {
            if (sm.keyword?.key === key) {
              hadItAlready = true;
            }
          });
        }
        if (!hadItAlready) {
          delete (targetUnit.keywords || {})[key];
        }
      }
    });
  // remove modifier
  targetUnit.staticModifiers = targetUnit.staticModifiers.filter(
    (sm) =>
      (!sourceUnit || sm.source.unitId !== sourceUnit.instanceId) &&
      (!sourceEffectName || sm.source.effectName !== sourceEffectName)
  );
}

export function addStaticKeyword(
  targetUnit: UnitDeployed,
  keyword: UnitKeywordDefinition,
  permanent: boolean,
  effectName: string,
  sourceUnit?: UnitDeployed
) {
  // don't add it if it had it already
  if (
    targetUnit.staticModifiers.filter(
      (sm) =>
        (!sourceUnit || sm.source.unitId === sourceUnit.instanceId) &&
        sm.source.effectName === effectName
    ).length > 0
  ) {
    console.log('had it already');
    return false;
  }
  if (!targetUnit.keywords) {
    targetUnit.keywords = {};
  }
  if (typeof keyword.value === 'number') {
    if (targetUnit.keywords[keyword.key]) {
      (targetUnit.keywords[keyword.key] as number) += keyword.value;
    } else {
      (targetUnit.keywords[keyword.key] as number) = keyword.value;
    }
  } else {
    (targetUnit.keywords[keyword.key] as boolean) = keyword.value as boolean;
  }
  targetUnit.staticModifiers.push({
    source: { unitId: sourceUnit?.instanceId, effectName },
    permanent,
    keyword,
  });
}
