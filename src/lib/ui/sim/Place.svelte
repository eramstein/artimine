<script lang="ts">
  import { UiView, type Npc, type Place } from '@/lib/_model';
  import { uiState } from '@/lib/_state';
  import { gs } from '@/lib/_state/main.svelte';
  import { initTrade } from '@/lib/_state/state-ui.svelte';
  import { initPlayerChat } from '@/lib/llm/chat';
  import { initDeckSelection } from '@/lib/sim/ongoing-battle';
  import CharacterPortrait from './CharacterPortrait.svelte';
  import ShopModal from './ShopModal.svelte';

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

  // Menu state
  let selectedCharacters = $state<Npc[]>([]);
  let menuPosition = $state({ x: 0, y: 0 });
  let showMenu = $derived(selectedCharacters.length > 0);

  // Handle character portrait click
  function handleCharacterClick(event: MouseEvent, character: Npc) {
    event.stopPropagation();

    // Toggle character selection
    const isSelected = selectedCharacters.some((c) => c.key === character.key);
    if (isSelected) {
      // Remove from selection
      selectedCharacters = selectedCharacters.filter((c) => c.key !== character.key);
    } else {
      // Add to selection
      selectedCharacters = [...selectedCharacters, character];
    }

    // Calculate menu position relative to the clicked portrait
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    menuPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top - 200, // Position on top of the portrait
    };
  }

  // Handle menu option click
  async function handleMenuOption(option: string) {
    if (selectedCharacters.length > 0) {
      if (option === 'play game' && selectedCharacters.length === 1) {
        await initDeckSelection(selectedCharacters[0]);
      } else if (option === 'trade' && selectedCharacters.length === 1) {
        await initTrade(selectedCharacters[0]);
      } else if (option === 'chat') {
        await initPlayerChat(selectedCharacters);
        uiState.currentView = UiView.Chat;
      }
    }
    selectedCharacters = [];
  }

  // Close menu when clicking outside
  function handleBackgroundClick() {
    selectedCharacters = [];
  }

  // Handle shop button click
  function handleShopClick() {
    uiState.shopModal.placeKey = place.key;
    uiState.shopModal.visible = true;
  }
</script>

<div class="place-container" style="--bg-image: url('{imagePath}')" onclick={handleBackgroundClick}>
  <!-- Shop Button -->
  {#if place.shopInventory && place.shopInventory.length > 0}
    <button class="shop-button" onclick={handleShopClick}>
      <span class="shop-icon">🛒</span>
      <span class="shop-label">Shop | {gs.player.cash}$</span>
    </button>
  {/if}

  <div class="characters-overlay">
    {#each charactersInPlace as character (character.key)}
      <div
        class="character-portrait-container"
        class:selected={selectedCharacters.some((c) => c.key === character.key)}
        onclick={(e) => handleCharacterClick(e, character)}
      >
        <CharacterPortrait {character} />
        {#if character.chatInitiation}
          <div class="chat-icon">💬</div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Character Menu -->
  {#if showMenu && selectedCharacters.length > 0}
    <div class="character-menu" style="left: {menuPosition.x}px; top: {menuPosition.y}px;">
      <div class="menu-header">
        <span class="character-name">
          {#if selectedCharacters.length === 1}
            {selectedCharacters[0].name}
          {:else}
            {selectedCharacters.length} characters selected
          {/if}
        </span>
      </div>
      <div class="menu-options">
        {#if selectedCharacters.length === 1}
          <button class="menu-option" onclick={() => handleMenuOption('play game')}>
            Play Game
          </button>
          <button class="menu-option" onclick={() => handleMenuOption('trade')}> Trade </button>
        {/if}
        <button class="menu-option" onclick={() => handleMenuOption('chat')}> Chat </button>
      </div>
    </div>
  {/if}

  <!-- Shop Modal -->
  <ShopModal />
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

  /* Shop Button Styles */
  .shop-button {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 12px 16px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    z-index: 10;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.4),
      0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .shop-button:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.5),
      0 3px 8px rgba(0, 0, 0, 0.3);
  }

  .shop-button:active {
    transform: translateY(0);
  }

  .shop-icon {
    font-size: 16px;
  }

  .shop-label {
    white-space: nowrap;
  }

  .characters-overlay {
    position: absolute;
    bottom: 60px;
    left: 60px;
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
    width: 300px;
    height: 300px;
    border-radius: 12px;
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.6),
      0 4px 12px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(6px);
    border: 3px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    position: relative;
    cursor: pointer;
  }

  .character-portrait-container:hover {
    transform: translateY(-4px);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.7),
      0 6px 16px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .character-portrait-container.selected {
    border-color: #4ade80;
    box-shadow:
      0 8px 24px rgba(74, 222, 128, 0.4),
      0 4px 12px rgba(74, 222, 128, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .chat-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    animation: chatPulse 2s ease-in-out infinite;
  }

  @keyframes chatPulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    50% {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
    }
  }

  /* Character Menu Styles */
  .character-menu {
    position: fixed;
    z-index: 1000;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(12px);
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.8),
      0 6px 16px rgba(0, 0, 0, 0.6);
    min-width: 200px;
    overflow: hidden;
    animation: menuAppear 0.2s ease-out;
  }

  @keyframes menuAppear {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  .menu-header {
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .character-name {
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    text-align: center;
    display: block;
  }

  .menu-options {
    padding: 8px;
  }

  .menu-option {
    width: 100%;
    padding: 12px 16px;
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    text-align: left;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 4px;
  }

  .menu-option:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }

  .menu-option:last-child {
    margin-bottom: 0;
  }

  .menu-option:active {
    transform: translateX(2px) scale(0.98);
  }
</style>
