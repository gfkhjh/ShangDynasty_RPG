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

/**
 * Persistent, scene-independent audio owner.
 *
 * Music, rain, digging, and footsteps deliberately use separate AudioSources
 * so no category can restart or interrupt another.
 */
@ccclass('GameAudioManager')
export class GameAudioManager extends Component {
  private static instance: GameAudioManager | null = null;

  private readonly rainVolume = 0.08;
  private readonly bgmVolume = 0.22;
  private readonly digVolume = 0.28;
  private readonly footstepVolume = 0.07;
  private readonly fadeDuration = 0.5;

  private bgmSource!: AudioSource;
  private rainSource!: AudioSource;
  private sfxSource!: AudioSource;
  private footstepSource!: AudioSource;
  private bgmClip: AudioClip | null = null;
  private rainClip: AudioClip | null = null;
  private digClip: AudioClip | null = null;
  private readonly footstepClips: Array<AudioClip | null> = [null, null, null, null];
  private readonly sceneSfxVolume = 0.5;
  private readonly sceneClips: Record<string, AudioClip | null> = {};
  private readonly sceneSfxNames = [
    'card_flip', 'reward_get', 'divine_success',
    'chapter_clear', 'level_up', 'dialog_open', 'map_transition',
  ];
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

    resources.load('audio/bgm_main_loop', AudioClip, (error, clip) => {
      if (error || !clip) {
        console.error('[GameAudioManager] Failed to load bgm_main_loop.wav', error);
        return;
      }
      this.bgmClip = clip;
      this.bgmSource.clip = clip;
      this.applyBgmState();
    });
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
    this.sceneSfxNames.forEach((name) => {
      resources.load(`audio/${name}`, AudioClip, (error, clip) => {
        if (error || !clip) {
          console.error(`[GameAudioManager] Failed to load ${name}.wav`, error);
          return;
        }
        this.sceneClips[name] = clip;
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

  /**
   * Play a one-shot scene/feedback sound effect by name.
   * Names: card_flip, reward_get, divine_success, chapter_clear,
   * level_up, dialog_open, map_transition.
   */
  playSfx(name: string, volume: number = this.sceneSfxVolume) {
    if (!this.audioUnlocked || !this.sfxEnabled) return;
    const clip = this.sceneClips[name];
    if (!clip) return;
    this.sfxSource.playOneShot(clip, volume);
  }

  update(dt: number) {
    this.digPlaybackTimer = Math.max(0, this.digPlaybackTimer - dt);
    this.footstepPlaybackTimer = Math.max(0, this.footstepPlaybackTimer - dt);
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
    const shouldPlay = this.audioUnlocked && this.sfxEnabled && this.rainRequested && Boolean(this.rainClip);
    this.rainTargetVolume = shouldPlay ? this.rainVolume : 0;
    if (shouldPlay && !this.rainSource.playing) {
      this.rainSource.volume = 0;
      this.rainSource.play();
    }
  }

  private applyBgmState() {
    const shouldPlay = this.audioUnlocked && this.musicEnabled && Boolean(this.bgmClip);
    if (shouldPlay && !this.bgmSource.playing) {
      this.bgmSource.volume = this.bgmVolume;
      this.bgmSource.play();
    } else if (!shouldPlay && this.bgmSource.playing) {
      this.bgmSource.stop();
    }
  }
}
