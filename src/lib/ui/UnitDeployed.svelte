<script lang="ts">
  import type { UnitCardDeployed } from '../_model';
  import { isUnitActive } from '../battle/unit';

  let { unit }: { unit: UnitCardDeployed } = $props();

  // Create the background image path using the card id (same as Card.svelte)
  let cardImagePath = $derived(`/src/assets/images/cards/${unit.id}.png`);

  // Determine if unit is active for border styling
  let isActive = $derived(isUnitActive(unit));
</script>

<div
  class="unit-deployed {isActive ? 'active' : 'inactive'}"
  style="background-image: url('{cardImagePath}')"
>
  <div class="stats">
    <div class="power">
      {unit.power}
    </div>
    <div class="health">
      {unit.health}
    </div>
  </div>
</div>

<style>
  .unit-deployed {
    position: relative;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 6px;
    overflow: hidden;
    border: 3px solid;
    transition: border-color 0.2s ease;
  }

  .unit-deployed.active {
    border-color: #bfa14a;
  }

  .unit-deployed.inactive {
    border-color: #666;
  }

  .stats {
    position: absolute;
    bottom: 8px;
    left: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 2;
  }

  .power,
  .health {
    background: #000;
    color: white;
    padding: 2px 4px;
    border-radius: 50%;
    font-weight: bold;
    font-size: 0.9rem;
    text-shadow: 0 1px 2px #000;
    min-width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid #bfa14a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .power {
    background: #000;
  }

  .health {
    background: #8b0000;
  }
</style>
