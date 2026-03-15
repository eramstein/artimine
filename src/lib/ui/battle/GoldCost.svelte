<script lang="ts">
  let { value, size = 'md', class: className = '' } = $props<{ 
    value: number | string; 
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }>();
</script>

<div class="gold-cost {size} {className}">
  <div class="value">{value}</div>
</div>

<style>
  .gold-cost {
    background: url('/assets/images/gold-contour.png') center/contain no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .value {
    font-weight: 900;
    color: #5f4a0e;
    line-height: 1;
    text-align: center;
    text-shadow:
      0 1px 1px rgba(255, 255, 255, 0.3),
      0 -1px 1px rgba(0, 0, 0, 0.1);
    margin-bottom: 0.15em;
  }

  .sm {
    width: 2.2rem;
  }
  .sm .value {
    font-size: 1rem;
  }

  .md {
    width: 2.8rem;
  }
  .md .value {
    font-size: 1.4rem;
  }

  .lg {
    width: 3.5rem;
  }
  .lg .value {
    font-size: 1.8rem;
  }
</style>
