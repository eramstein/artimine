<script lang="ts">
  import { getLandImagePath } from '@lib/_utils/asset-paths';
  import type { LandTemplate } from '../../_model/model-battle';

  let { land }: { land: LandTemplate } = $props();

  // Create the background image path using the land id
  let landImagePath = $derived(getLandImagePath(land.id));
</script>

<div class="land-full">
  <!-- Land name bar -->
  <div class="name">
    <span class="name-text">{land.name}</span>
  </div>

  <!-- Content area with land image background -->
  <div class="content" style="background-image: url('{landImagePath}');">
    <!-- Empty content area - just the image background -->
  </div>
</div>

<style>
  .land-full {
    width: 512px;
    border-radius: 16px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
    border: 3px solid #bfa14a;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
    background: #000;
    overflow: hidden;
  }

  .content {
    width: 512px;
    height: 512px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px;
    position: relative;
    flex-shrink: 0;
  }

  .content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    pointer-events: none;
  }

  .name {
    background: #000;
    color: white;
    padding: 16px 20px;
    font-weight: bold;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    border-radius: 13px 13px 0 0;
  }

  .name-text {
    color: white;
    font-weight: bold;
  }
</style>
