<script lang="ts">
  import { uiState } from '../_state';

  let targetPrompt = $derived(() => {
    const battle = uiState.battle;
    if (!battle.targetBeingSelected) return null;

    const count = battle.targetBeingSelected.count || 1;
    const type = battle.targetBeingSelected.type;
    const currentIndex = battle.currentTargetIndex || 0;

    let totalSteps = 1;
    if (battle.abilityPending) {
      totalSteps = battle.abilityPending.ability.targets?.length || 1;
    } else if (battle.spellPending) {
      totalSteps = battle.spellPending.targets?.length || 1;
    }

    const stepIndicator = totalSteps > 1 ? ` (${currentIndex + 1}/${totalSteps})` : '';

    return {
      text: `Select ${count} ${type}${stepIndicator}`,
      isVisible: true,
    };
  });
</script>

{#if targetPrompt()?.isVisible}
  <div class="target-prompt">
    {targetPrompt()?.text}
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
    white-space: nowrap;
    z-index: 1000;
    border: 2px solid #ffd700;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.5),
      0 0 20px rgba(255, 215, 0, 0.3);
    animation: pulse 2s ease-in-out infinite alternate;
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
