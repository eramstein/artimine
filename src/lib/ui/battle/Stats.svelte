<script lang="ts">
  let { power, health, maxHealth }: { power: number; health?: number; maxHealth?: number } =
    $props();
</script>

<div class="stats">
  <div class="power">
    {power}
  </div>
  <div class="health">
    {health || maxHealth || '0'}
  </div>
</div>

<style>
  .stats {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
  }

  .power,
  .health {
    background: #000;
    color: white;
    padding: 2px 4px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9rem;
    text-shadow: 0 1px 2px #000;
    width: 21px;
    height: 21px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid #bfa14a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  .power {
    background: rgba(0, 0, 0, 0.8);
  }

  .health {
    background: rgba(139, 0, 0, 0.8);
  }
</style>
