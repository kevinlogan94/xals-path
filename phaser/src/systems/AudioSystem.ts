import type Phaser from 'phaser';
import type { RegionId } from '../types';

type Track =
  | 'xals-theme'
  | 'barlogs-theme'
  | 'meadow'
  | 'river'
  | 'altar'
  | 'cast'
  | 'pop'
  | 'levelup'
  | 'buff'
  | 'debuff'
  | 'coin';

export class AudioSystem {
  private scene: Phaser.Scene | null = null;
  private currentBgm: Phaser.Sound.BaseSound | null = null;
  muted = false;

  attach(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  playBgm(key: Track, loop = true): void {
    if (!this.scene || this.muted) return;
    if (this.currentBgm) {
      this.currentBgm.stop();
      this.currentBgm.destroy();
      this.currentBgm = null;
    }
    if (!this.scene.cache.audio.exists(key)) return;
    this.currentBgm = this.scene.sound.add(key, { loop, volume: 0.45 });
    this.currentBgm.play();
  }

  playRegion(region: RegionId): void {
    this.playBgm(region);
  }

  playSfx(key: Track, volume = 0.55): void {
    if (!this.scene || this.muted) return;
    if (!this.scene.cache.audio.exists(key)) return;
    this.scene.sound.play(key, { volume });
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.currentBgm?.pause();
      this.scene?.sound.stopAll();
    } else {
      this.currentBgm?.resume();
    }
    return this.muted;
  }
}
