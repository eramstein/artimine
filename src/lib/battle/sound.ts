// Sound effects for battle actions
class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.preloadSounds();
  }

  private preloadSounds() {
    const soundFiles = {
      'karate-chop': '/src/assets/sounds/battle/karate-chop.mp3',
      'power-punch': '/src/assets/sounds/battle/power-punch.mp3',
      jumpland: '/src/assets/sounds/battle/jumpland.mp3',
    };

    for (const [name, path] of Object.entries(soundFiles)) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    }
  }

  playSound(soundName: string) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      // Reset to beginning and play
      sound.currentTime = 0;
      sound.play().catch((error) => {
        console.warn('Failed to play sound:', soundName, error);
      });
    }
  }

  playAttackSound(attackerPower: number) {
    if (attackerPower <= 3) {
      this.playSound('karate-chop');
    } else {
      this.playSound('power-punch');
    }
  }

  playDeploySound() {
    this.playSound('jumpland');
  }
}

// Create a singleton instance
export const soundManager = new SoundManager();
