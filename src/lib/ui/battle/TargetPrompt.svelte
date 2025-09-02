<script lang="ts">
  import { uiState } from '@lib/_state';
  import { DataEffectTemplates } from '@lib/battle/effects/effect-templates';

  let targetPrompt = $derived(() => {
    const battle = uiState.battle;
    if (!battle.targetBeingSelected) return null;

    const targetText = `${battle.targetBeingSelected.count || ''} ${battle.targetBeingSelected.type}`;

    // Get count of currently selected targets for the current effect and target index
    const currentEffectIndex = battle.currentEffectIndex || 0;
    const currentTargetIndex = battle.currentTargetIndex || 0;
    const selectedCount =
      battle.selectedTargets[currentEffectIndex]?.[currentTargetIndex]?.length || 0;
    const requiredCount = battle.targetBeingSelected.count || 1;

    // Only show count if more than 1 target is required
    const countText = requiredCount > 1 ? ` (${selectedCount}/${requiredCount})` : '';

    // Get the effect text for the current effect
    let effectText = '';
    if (battle.abilityPending) {
      const currentEffect = battle.abilityPending.ability.actions[currentEffectIndex];
      if (currentEffect) {
        effectText = DataEffectTemplates[currentEffect.effect.name](
          currentEffect.effect.args
        ).label(currentEffect.targets || []);
      }
    } else if (battle.spellPending) {
      const currentEffect = battle.spellPending.actions[currentEffectIndex];
      if (currentEffect) {
        effectText = DataEffectTemplates[currentEffect.effect.name](
          currentEffect.effect.args
        ).label(currentEffect.targets || []);
      }
    } else if (battle.triggeredAbilityPending) {
      const currentEffect = battle.triggeredAbilityPending.ability.actions[currentEffectIndex];
      if (currentEffect) {
        effectText = DataEffectTemplates[currentEffect.effect.name](
          currentEffect.effect.args
        ).label(currentEffect.targets || []);
      }
    }

    return {
      text: `Select ${targetText}${countText}`,
      effectText,
      isVisible: true,
    };
  });
</script>

{#if targetPrompt()?.isVisible}
  <div class="target-prompt">
    <div class="target-text">{targetPrompt()?.text}</div>
    {#if targetPrompt()?.effectText}
      <div class="effect-text">{targetPrompt()?.effectText}</div>
    {/if}
  </div>
{/if}

<style>
  .target-prompt {
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: #ffd700;
    font-weight: bold;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 1rem;
    z-index: 1000;
    border: 2px solid #ffd700;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(255, 215, 0, 0.3);
    animation: pulse 2s ease-in-out infinite alternate;
    text-align: center;
    min-width: 200px;
  }

  .target-text {
    margin-bottom: 8px;
    white-space: nowrap;
  }

  .effect-text {
    font-size: 0.85rem;
    color: #ffffff;
    font-weight: normal;
    line-height: 1.3;
    max-width: 300px;
    word-wrap: break-word;
  }

  @keyframes pulse {
    from {
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.5),
        0 0 20px rgba(255, 215, 0, 0.3);
    }
    to {
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.5),
        0 0 30px rgba(255, 215, 0, 0.5);
    }
  }
</style>
