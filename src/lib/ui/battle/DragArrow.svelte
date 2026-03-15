<script lang="ts">
  import { uiState } from '@lib/_state';

  let arrow = $derived(uiState.battle.dragArrow);
</script>

{#if arrow && arrow.active}
  <svg
    class="drag-arrow-overlay"
    width="100%"
    height="100%"
    viewBox="0 0 {typeof window !== 'undefined' ? window.innerWidth : 1920} {typeof window !==
    'undefined'
      ? window.innerHeight
      : 1080}"
  >
    <defs>
      <marker
        id="drag-arrowhead"
        markerWidth="4"
        markerHeight="4"
        refX="4"
        refY="2"
        orient="auto"
      >
        <path d="M0,0 L4,2 L0,4 Z" fill="var(--color-golden)" />
      </marker>
      <filter id="drag-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <line
      x1={arrow.startX}
      y1={arrow.startY}
      x2={arrow.currentX}
      y2={arrow.currentY}
      stroke="rgba(0,0,0,0.5)"
      stroke-width="8"
      stroke-linecap="round"
      marker-end="url(#drag-arrowhead)"
    />
    <line
      x1={arrow.startX}
      y1={arrow.startY}
      x2={arrow.currentX}
      y2={arrow.currentY}
      stroke="var(--color-golden)"
      stroke-width="4"
      stroke-linecap="round"
      marker-end="url(#drag-arrowhead)"
      filter="url(#drag-glow)"
    />
  </svg>
{/if}

<style>
  .drag-arrow-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 2000;
  }
</style>
