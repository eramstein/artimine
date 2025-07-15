<script lang="ts">
  import {
    computePosition,
    flip,
    shift,
    offset,
    type Placement,
    type Strategy,
  } from '@floating-ui/dom';

  let {
    content,
    placement = 'top' as Placement,
    strategy = 'fixed' as Strategy,
    offsetValue = 8,
    show = false,
    children,
  } = $props<{
    content: string;
    placement?: Placement;
    strategy?: Strategy;
    offsetValue?: number;
    show?: boolean;
    children?: any;
  }>();

  let tooltipElement = $state<HTMLElement>();
  let referenceElement = $state<HTMLElement>();
  let tooltipStyle = $state('');
  let currentPlacement = $state(placement);

  function updatePosition() {
    if (!referenceElement || !tooltipElement) return;

    computePosition(referenceElement, tooltipElement, {
      placement,
      strategy,
      middleware: [offset(offsetValue), flip(), shift({ padding: 8 })],
    }).then(({ x, y, placement: computedPlacement }) => {
      tooltipStyle = `position: ${strategy}; left: ${x}px; top: ${y}px;`;
      currentPlacement = computedPlacement;
    });
  }

  $effect(() => {
    if (show) {
      updatePosition();
    }
  });
</script>

<div bind:this={referenceElement} class="tooltip-reference">
  {@render children?.()}
</div>

{#if show}
  <div
    bind:this={tooltipElement}
    class="tooltip"
    style={tooltipStyle}
    role="tooltip"
    data-popper-placement={currentPlacement}
  >
    {content}
  </div>
{/if}

<style>
  .tooltip-reference {
    display: inline-block;
  }

  .tooltip {
    background: rgba(0, 0, 0, 0.95);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    max-width: 300px;
    min-width: 200px;
    text-align: center;
    z-index: 1000;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--color-golden);
    white-space: normal;
    word-wrap: break-word;
    line-height: 1.3;
  }

  .tooltip::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 6px solid transparent;
  }

  /* Arrow positioning based on placement */
  .tooltip[data-popper-placement^='top']::after {
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-top-color: rgba(0, 0, 0, 0.95);
  }

  .tooltip[data-popper-placement^='bottom']::after {
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-bottom-color: rgba(0, 0, 0, 0.95);
  }

  .tooltip[data-popper-placement^='left']::after {
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-left-color: rgba(0, 0, 0, 0.95);
  }

  .tooltip[data-popper-placement^='right']::after {
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    border-right-color: rgba(0, 0, 0, 0.95);
  }
</style>
