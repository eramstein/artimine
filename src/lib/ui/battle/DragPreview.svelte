<script lang="ts">
  import { onMount } from 'svelte';
  import { uiState } from '@lib/_state';
  import { CARD_WIDTH, CARD_HEIGHT } from '@lib/_config/ui-config';
  import Card from './Card.svelte';
  import type { Card as CardType } from '@lib/_model/model-battle';

  let draggingCard = $state<CardType | null>(null);
  let mousePos = $state({ x: 0, y: 0 });

  onMount(() => {
    const handleDragOver = (e: DragEvent) => {
      mousePos = { x: e.clientX, y: e.clientY };
      
      // If we don't have a draggingCard yet, try to find it from the dataTransfer
      // Note: dataTransfer.getData('application/json') is often only available on 'drop'
      // but we can use a global state or a singleton if needed.
      // However, we can't easily get the JSON data here.
      // We'll rely on a small global state for the "active card being dragged"
    };

    window.addEventListener('dragover', handleDragOver);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
    };
  });

  // We'll add this to uiState instead of dragArrow since it's simpler
</script>

{#if uiState.battle.draggingCard}
  <div
    class="card-drag-preview"
    style:left="{mousePos.x + 20}px"
    style:top="{mousePos.y - 260}px"
  >
    <Card card={uiState.battle.draggingCard} inHand={false} displayKeywords={false} />
  </div>
{/if}

<style>
  .card-drag-preview {
    position: fixed;
    pointer-events: none;
    z-index: 2000;
    transform: scale(0.9);
    filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.6));
    opacity: 0.95;
    transition: none;
  }
</style>
