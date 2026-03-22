<script lang="ts">
  import { CardColor } from '@/lib/_model/enums-battle';
  import { getAssetPath } from '@lib/_utils/asset-paths';

  let { cost, colors = [] }: { cost: number; colors?: { color: CardColor; count: number }[] } = $props();

  function getColorImagePath(color: CardColor): string {
    return getAssetPath(`images/color_${color}.png`);
  }
</script>

{#if cost > 0 || (colors && colors.length > 0)}
  <div
    class="corner-badge-cluster"
    style="background-image: url('{getAssetPath('images/mana-corner.png')}');"
  >
    {#if cost > 0}
      <div class="cost">
        {cost}
      </div>
    {/if}
    {#if colors && colors.length > 0}
      <div class="colors">
        {#each colors as colorInfo}
          <div
            class="color-stack"
            title="{colorInfo.color} ({colorInfo.count})"
            style="width: {14 + (colorInfo.count - 1) * 8}px;"
          >
            {#each Array(colorInfo.count) as _, index}
              <div
                class="color-indicator"
                style="background-image: url('{getColorImagePath(
                  colorInfo.color
                )}'); z-index: {index + 1}; left: {index * 8}px;"
              ></div>
            {/each}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .corner-badge-cluster {
    position: absolute;
    top: -6px;
    left: -6px;
    width: 50px;
    height: 54px;
    background-size: 100% 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 4px;
    gap: 0;
    z-index: 5;
  }

  .cost {
    color: white;
    font-weight: bold;
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-shadow: 0 1px 2px #000;
    flex-shrink: 0;
    margin-bottom: 6px;
    line-height: 1;
  }

  .colors {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .color-stack {
    position: relative;
    height: 14px;
    margin-top: -4px;
  }

  .color-indicator {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid var(--color-golden);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
</style>
