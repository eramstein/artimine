<script lang="ts">
  import type { Land } from '../_model/model-battle';

  let { land }: { land: Land } = $props();

  let imagePath = $derived(`/src/assets/images/lands/${land.id}.png`);
</script>

<div class="land" style="background-image: url('{imagePath}')">
  <div class="health">
    {land.health}
  </div>
</div>

<style>
  .land {
    position: relative;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border: 2px solid #333;
    border-radius: 8px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
  }

  .health {
    position: absolute;
    bottom: 4px;
    left: 4px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    min-width: 20px;
    text-align: center;
  }
</style>
