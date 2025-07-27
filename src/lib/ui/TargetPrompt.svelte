<script lang="ts">
  import { uiState } from '../_state';

  let targetPrompt = $derived(() => {
    const battle = uiState.battle;
    if (!battle.targetBeingSelected) return null;

    const targetText =
      battle.targetBeingSelected.text ||
      `${battle.targetBeingSelected.count} ${battle.targetBeingSelected.type}`;

    // Get count of currently selected targets for the current effect and target index
    const currentEffectIndex = battle.currentEffectIndex || 0;
    const currentTargetIndex = battle.currentTargetIndex || 0;
    const selectedCount =
      battle.selectedTargets[currentEffectIndex]?.[currentTargetIndex]?.length || 0;
    const requiredCount = battle.targetBeingSelected.count || 1;

    // Only show count if more than 1 target is required
    const countText = requiredCount > 1 ? ` (${selectedCount}/${requiredCount})` : '';

    return {
      text: `Select ${targetText}${countText}`,
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
