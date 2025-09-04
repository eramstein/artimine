<script lang="ts">
  import type { Place } from '@/lib/_model';
  import { gs } from '@/lib/_state/main.svelte';
  import CharacterPortrait from './CharacterPortrait.svelte';
  import TimeDisplay from './TimeDisplay.svelte';

  let { place }: { place: Place } = $props();

  // Map place names to image filenames
  function getPlaceImagePath(placeName: string): string {
    const imageName = place.key || 'bedroom'; // default fallback
    return `/assets/images/places/${imageName}.jpg`;
  }

  let imagePath = $derived(getPlaceImagePath(place.name));

  // Get all characters in this place
  let charactersInPlace = $derived(
    Object.values(gs.characters).filter((char) => char.place === place.index)
  );
</script>

<div class="place-container" style="--bg-image: url('{imagePath}')">
  <TimeDisplay />
  <div class="characters-overlay">
    {#each charactersInPlace as character (character.key)}
      <div class="character-portrait-container">
        <CharacterPortrait {character} />
      </div>
    {/each}
  </div>
</div>

<style>
  .place-container {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: var(--bg-image);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .characters-overlay {
    position: absolute;
    bottom: 40px;
    left: 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: flex-start;
    gap: 20px;
    z-index: 5;
    max-height: calc(100% - 80px);
    overflow: hidden;
  }

  .character-portrait-container {
    width: 180px;
    height: 180px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
  }
</style>
