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
 * Ambient loops and one-shot effects deliberately use separate AudioSources so
 * a shovel hit can never restart, interrupt, or duplicate the rain bed.
 */
@ccclass('GameAudioManager')
export class GameAudioManager extends Component {
  private static instance: GameAudioManager | null = null;

  private readonly rainVolume = 0.24;
  private readonly digVolume = 0.72;
  private readonly fadeDuration = 0.5;

  private rainSource!: AudioSource;
  private sfxSource!: AudioSource;
  private rainClip: AudioClip | null = null;
  private digClip: AudioClip | null = null;
  private rainRequested = false;
  private sfxEnabled = true;
  private audioUnlocked = !sys.isBrowser;
  private rainTargetVolume = 0;
  private digPlaybackTimer = 0;

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

    this.rainSource = this.node.addComponent(AudioSource);
    this.rainSource.loop = true;
    this.rainSource.volume = 0;
    this.sfxSource = this.node.addComponent(AudioSource);

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
  }

  /**
   * Call from a real key/touch event. Browsers require that first gesture
   * before an AudioContext is allowed to begin playback.
   */
  unlockFromUserGesture() {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;
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
    this.digPlaybackTimer = 0.82;
  }

  update(dt: number) {
    this.digPlaybackTimer = Math.max(0, this.digPlaybackTimer - dt);
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
}
