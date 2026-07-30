import {
  _decorator,
  AudioClip,
  AudioSource,
  Component,
  game,
  Node,
  resources,
  sys,
} from 'cc';

const { ccclass } = _decorator;

export type BgmTrack = 'main' | 'wild';

/**
 * Persistent, scene-independent audio owner.
 *
 * Music, rain, digging, and footsteps deliberately use separate AudioSources
 * so no category can restart or interrupt another.
 */
@ccclass('GameAudioManager')
export class GameAudioManager extends Component {
  private static instance: GameAudioManager | null = null;

  private readonly rainVolume = 0.06;
  private readonly bgmVolume = 0.22;
  private readonly digVolume = 0.28;
  private readonly footstepVolume = 0.07;
  private readonly fadeDuration = 0.5;

  private bgmSource!: AudioSource;
  private rainSource!: AudioSource;
  private sfxSource!: AudioSource;
  private footstepSource!: AudioSource;
  private readonly bgmClips: Record<BgmTrack, AudioClip | null> = { main: null, wild: null };
  private readonly bgmPositions: Record<BgmTrack, number> = { main: 0, wild: 0 };
  private requestedBgm: BgmTrack = 'main';
  private activeBgm: BgmTrack | null = null;
  private bgmTargetVolume = 0;
  private hallMuted = false;
  private rainClip: AudioClip | null = null;
  private digClip: AudioClip | null = null;
  private readonly footstepClips: Array<AudioClip | null> = [null, null, null, null];
  private rainRequested = false;
  private musicEnabled = true;
  private sfxEnabled = true;
  private audioUnlocked = !sys.isBrowser;
  private rainTargetVolume = 0;
  private digPlaybackTimer = 0;
  private footstepPlaybackTimer = 0;
  private lastFootstepIndex = -1;

  static ensure(): GameAudioManager {
    if (this.instance?.node?.isValid) return this.instance;

    const root = new Node('GameAudioManager');
    const manager = root.addComponent(GameAudioManager);
    game.addPersistRootNode(root);
    this.instance = manager;
    return manager;
  }

  onLoad() {
    if (GameAudioManager.instance && GameAudioManager.instance !== this) {
      this.node.destroy();
      return;
    }
    GameAudioManager.instance = this;

    this.bgmSource = this.node.addComponent(AudioSource);
    this.bgmSource.loop = true;
    this.bgmSource.volume = this.bgmVolume;
    this.rainSource = this.node.addComponent(AudioSource);
    this.rainSource.loop = true;
    this.rainSource.volume = 0;
    this.sfxSource = this.node.addComponent(AudioSource);
    this.footstepSource = this.node.addComponent(AudioSource);

    this.loadBgmTrack('main', 'audio/bgm_main_loop');
    this.loadBgmTrack('wild', 'audio/bgm_wild_loop');
    resources.load('audio/rain_loop', AudioClip, (error, clip) => {
      if (error || !clip) {
        console.error('[GameAudioManager] Failed to load rain_loop.wav', error);
        return;
      }
      this.rainClip = clip;
      this.rainSource.clip = clip;
      this.applyRainState();
    });
    resources.load('audio/shovel_dig', AudioClip, (error, clip) => {
      if (error || !clip) {
        console.error('[GameAudioManager] Failed to load shovel_dig.wav', error);
        return;
      }
      this.digClip = clip;
    });
    this.footstepClips.forEach((_clip, index) => {
      const path = `audio/footstep_grass_${index + 1}`;
      resources.load(path, AudioClip, (error, clip) => {
        if (error || !clip) {
          console.error(`[GameAudioManager] Failed to load ${path}.wav`, error);
          return;
        }
        this.footstepClips[index] = clip;
      });
    });
  }

  /**
   * Call from a real key/touch event. Browsers require that first gesture
   * before an AudioContext is allowed to begin playback.
   */
  unlockFromUserGesture() {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;
    this.applyBgmState();
    this.applyRainState();
  }

  setMusicEnabled(enabled: boolean) {
    if (this.musicEnabled === enabled) return;
    this.musicEnabled = enabled;
    this.applyBgmState();
  }

  setBgmTrack(track: BgmTrack) {
    if (this.requestedBgm === track) {
      this.applyBgmState();
      return;
    }
    this.requestedBgm = track;
    this.applyBgmState();
  }

  setHallMuted(muted: boolean) {
    if (this.hallMuted === muted) return;
    this.hallMuted = muted;
    this.applyBgmState();
    this.applyRainState();
  }

  setSfxEnabled(enabled: boolean) {
    if (this.sfxEnabled === enabled) return;
    this.sfxEnabled = enabled;
    this.applyRainState();
  }

  setRaining(raining: boolean) {
    if (this.rainRequested === raining) return;
    this.rainRequested = raining;
    this.applyRainState();
  }

  playShovelDig() {
    if (!this.audioUnlocked || !this.sfxEnabled || !this.digClip || this.digPlaybackTimer > 0) return;
    this.sfxSource.playOneShot(this.digClip, this.digVolume);
    this.digPlaybackTimer = 0.42;
  }

  playFootstep() {
    if (!this.audioUnlocked || !this.sfxEnabled || this.footstepPlaybackTimer > 0) return;
    const available = this.footstepClips
      .map((clip, index) => ({ clip, index }))
      .filter((entry): entry is { clip: AudioClip; index: number } => Boolean(entry.clip));
    if (available.length === 0) return;
    let candidates = available.filter(entry => entry.index !== this.lastFootstepIndex);
    if (candidates.length === 0) candidates = available;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    this.lastFootstepIndex = chosen.index;
    this.footstepSource.playOneShot(chosen.clip, this.footstepVolume);
    this.footstepPlaybackTimer = 0.22;
  }

  update(dt: number) {
    this.digPlaybackTimer = Math.max(0, this.digPlaybackTimer - dt);
    this.footstepPlaybackTimer = Math.max(0, this.footstepPlaybackTimer - dt);
    this.updateBgmFade(dt);
    if (!this.rainSource) return;
    const step = this.rainVolume * dt / this.fadeDuration;
    const current = this.rainSource.volume;
    if (Math.abs(current - this.rainTargetVolume) <= step) {
      this.rainSource.volume = this.rainTargetVolume;
      if (this.rainTargetVolume === 0 && this.rainSource.playing) this.rainSource.stop();
      return;
    }
    this.rainSource.volume = current + Math.sign(this.rainTargetVolume - current) * step;
  }

  private applyRainState() {
    const shouldPlay = !this.hallMuted && this.audioUnlocked && this.sfxEnabled && this.rainRequested && Boolean(this.rainClip);
    this.rainTargetVolume = shouldPlay ? this.rainVolume : 0;
    if (shouldPlay && !this.rainSource.playing) {
      this.rainSource.volume = 0;
      this.rainSource.play();
    }
  }

  private loadBgmTrack(track: BgmTrack, path: string) {
    resources.load(path, AudioClip, (error, clip) => {
      if (error || !clip) {
        console.error(`[GameAudioManager] Failed to load ${path}.wav`, error);
        return;
      }
      this.bgmClips[track] = clip;
      this.applyBgmState();
    });
  }

  private applyBgmState() {
    if (!this.bgmSource) return;
    const requestedClip = this.bgmClips[this.requestedBgm];
    const shouldPlay = !this.hallMuted && this.audioUnlocked && this.musicEnabled && Boolean(requestedClip);
    if (!shouldPlay) {
      this.bgmTargetVolume = 0;
      return;
    }
    if (this.activeBgm !== this.requestedBgm) {
      if (this.bgmSource.playing) {
        this.bgmTargetVolume = 0;
      } else {
        this.startBgmTrack(this.requestedBgm);
      }
      return;
    }
    if (!this.bgmSource.playing) this.startBgmTrack(this.requestedBgm);
    this.bgmTargetVolume = this.bgmVolume;
  }

  private updateBgmFade(dt: number) {
    if (!this.bgmSource) return;
    const step = this.bgmVolume * dt / this.fadeDuration;
    const current = this.bgmSource.volume;
    if (Math.abs(current - this.bgmTargetVolume) > step) {
      this.bgmSource.volume = current + Math.sign(this.bgmTargetVolume - current) * step;
      return;
    }
    this.bgmSource.volume = this.bgmTargetVolume;
    if (this.bgmTargetVolume > 0 || !this.bgmSource.playing) return;

    this.rememberActiveBgmPosition();
    this.bgmSource.stop();
    if (!this.hallMuted && this.audioUnlocked && this.musicEnabled && this.bgmClips[this.requestedBgm]) {
      this.startBgmTrack(this.requestedBgm);
      this.bgmTargetVolume = this.bgmVolume;
    }
  }

  private rememberActiveBgmPosition() {
    if (!this.activeBgm || !this.bgmSource) return;
    const position = this.bgmSource.currentTime;
    if (Number.isFinite(position) && position >= 0) this.bgmPositions[this.activeBgm] = position;
  }

  private startBgmTrack(track: BgmTrack) {
    const clip = this.bgmClips[track];
    if (!clip) return;
    if (this.bgmSource.playing) {
      this.rememberActiveBgmPosition();
      this.bgmSource.stop();
    }
    this.activeBgm = track;
    this.bgmSource.clip = clip;
    this.bgmSource.volume = 0;
    this.bgmSource.play();
    const duration = this.bgmSource.duration;
    const resumeAt = this.bgmPositions[track];
    if (Number.isFinite(duration) && duration > 0 && resumeAt > 0) {
      this.bgmSource.currentTime = resumeAt % duration;
    }
  }
}
