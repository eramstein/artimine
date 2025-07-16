import { cards } from '@/data';
import type {
  UnitCardTemplate,
  UnitDeployed,
  UnitKeywordDefinition,
} from '@/lib/_model/model-battle';
import { bs } from '../_state';

// TODO: abilities and attack updates

// when a unit is destroyed, we need to clear all static abilities it generated
export function clearUnitStaticAbilities(unit: UnitDeployed) {
  bs.units.forEach((targetUnit) => {
    targetUnit.staticModifiers
      .filter((sm) => sm.source.unitId === unit.instanceId && !sm.permanent)
      .forEach((sm) => {
        if (sm.keyword) {
          removeStaticKeyword(targetUnit, unit);
        }
      });
  });
}

export function removeStaticKeyword(
  targetUnit: UnitDeployed,
  sourceUnit: UnitDeployed,
  sourceAbilityName?: string
) {
  targetUnit.staticModifiers
    .filter(
      (sm) =>
        sm.keyword &&
        sm.source.unitId === sourceUnit.instanceId &&
        (!sourceAbilityName || sm.source.abilityName === sourceAbilityName)
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

  targetUnit.staticModifiers = targetUnit.staticModifiers.filter(
    (sm) =>
      sm.source.unitId !== sourceUnit.instanceId || sm.source.abilityName !== sourceAbilityName
  );
}

export function addStaticKeyword(
  targetUnit: UnitDeployed,
  sourceUnit: UnitDeployed,
  keyword: UnitKeywordDefinition,
  permanent: boolean,
  sourceAbilityName: string
) {
  if (
    targetUnit.staticModifiers.filter(
      (sm) =>
        sm.source.unitId === sourceUnit.instanceId && sm.source.abilityName === sourceAbilityName
    ).length > 0
  ) {
    return false;
  }
  if (!targetUnit.keywords) {
    targetUnit.keywords = { [keyword.key]: 0 };
  }
  if (typeof keyword.value === 'number') {
    (targetUnit.keywords[keyword.key] as number) += keyword.value;
  } else {
    (targetUnit.keywords[keyword.key] as boolean) = keyword.value as boolean;
  }
  targetUnit.staticModifiers.push({
    source: { unitId: sourceUnit.instanceId, abilityName: sourceAbilityName },
    permanent,
    keyword,
  });
}
