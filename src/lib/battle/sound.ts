// Sound effects for battle actions
import { getSoundPath } from '@lib/_utils/asset-paths';

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.preloadSounds();
  }

  private preloadSounds() {
    const soundFiles = {
      'karate-chop': getSoundPath('karate-chop'),
      'power-punch': getSoundPath('power-punch'),
      jumpland: getSoundPath('jumpland'),
      lightning: getSoundPath('lightning'),
      draw: getSoundPath('draw'),
      button: getSoundPath('button'),
      button2: getSoundPath('button2'),
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

  playDamageSound() {
    this.playSound('lightning');
  }
}

// Create a singleton instance
export const soundManager = new SoundManager();
