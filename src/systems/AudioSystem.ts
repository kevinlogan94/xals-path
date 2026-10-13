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
  private desiredBgm: Track | null = null;
  muteBgm = false;
  muteSfx = false;

  attach(scene: Phaser.Scene | null): void {
    if (!scene && this.currentBgm) {
      this.currentBgm.stop();
      this.currentBgm.destroy();
      this.currentBgm = null;
    }
    this.scene = scene;
  }

  playBgm(key: Track, loop = true): void {
    if (!this.scene) return;
    this.scene.sound.unlock();
    const ctx = (this.scene.sound as Phaser.Sound.WebAudioSoundManager).context;
    if (ctx?.state === 'suspended') void ctx.resume();
    if (this.desiredBgm === key && this.currentBgm?.isPlaying) return;
    this.desiredBgm = key;
    if (this.currentBgm) {
      this.currentBgm.stop();
      this.currentBgm.destroy();
      this.currentBgm = null;
    }
    if (this.muteBgm) return;
    if (!this.scene.cache.audio.exists(key)) return;
    this.currentBgm = this.scene.sound.add(key, { loop, volume: 0.45 });
    this.currentBgm.play();
  }

  playRegion(region: RegionId): void {
    this.playBgm(region);
  }

  playSfx(key: Track, volume = 0.55): void {
    if (!this.scene || this.muteSfx) return;
    if (!this.scene.cache.audio.exists(key)) return;
    this.scene.sound.play(key, { volume });
  }

  toggleMuteBgm(): boolean {
    this.muteBgm = !this.muteBgm;
    if (this.muteBgm) {
      this.currentBgm?.pause();
    } else if (this.desiredBgm) {
      this.playBgm(this.desiredBgm);
    }
    return this.muteBgm;
  }

  toggleMuteSfx(): boolean {
    this.muteSfx = !this.muteSfx;
    if (this.muteSfx) {
      this.scene?.sound.stopAll();
      this.currentBgm = null;
      if (!this.muteBgm && this.desiredBgm) this.playBgm(this.desiredBgm);
    }
    return this.muteSfx;
  }
}
