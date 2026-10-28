import type Phaser from 'phaser';
import type { RegionId } from '../types';

const BGM = ['xals-theme', 'barlogs-theme', 'meadow', 'river', 'altar'] as const;

/** Keys written by `pnpm sfx`. Adding a sound means one entry here. */
export const SFX = [
  'ui-tap',
  'denied',
  'barrier',
  'cast',
  'creature-tap',
  'tome-buy',
  'lock-rattle',
  'lock-shatter',
  'creature-reveal',
  'page-turn',
  'chapter-start',
  'portal',
  'pegasus-enter',
  'pegasus-tap',
  'blessing-on',
  'blessing-off',
  'level-ready',
  'level-up',
  'collect',
  'achievement',
  'reward',
  'end-game',
] as const;

export const SFX_EXT = '.mp3';

type Bgm = (typeof BGM)[number];
export type Sfx = (typeof SFX)[number];

const JITTER = new Set<Sfx>(['ui-tap', 'cast', 'creature-tap']);

export class AudioSystem {
  private scene: Phaser.Scene | null = null;
  private currentBgm: Phaser.Sound.BaseSound | null = null;
  private desiredBgm: Bgm | null = null;
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

  playBgm(key: Bgm, loop = true): void {
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

  playSfx(key: Sfx, volume = 0.45, rate = 1): void {
    if (!this.scene || this.muteSfx) return;
    if (!this.scene.cache.audio.exists(key)) return;
    const played = JITTER.has(key) ? rate * (0.97 + Math.random() * 0.06) : rate;
    this.scene.sound.play(key, { volume, rate: played });
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
